import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import express, { Router, Request, Response, NextFunction } from 'express';
import lodashOmit from 'lodash/omit';
import lodashChunk from 'lodash/chunk';

import { hashPassword, verifyPassword, encrypt, decrypt } from 'server/helpers/session';
import {
  SignupRequest,
  LoginRequest,
  UserRecord,
  SafeUserRecord,
  SessionRecord,
  ForgotPasswordRequest,
  VerifyEmailRequest,
  ResetPasswordRequest,
} from 'shared/types/auth';

import verifyEmail from 'server/email/templates/verifyEmail';
import forgotPassword from 'server/email/templates/resetPassword';
import { sendEmail } from 'server/email/mailer';

const _30_DAYS_SECONDS = 60 * 60 * 24 * 30;
type AuthControllerConfig = {
  dynamoDocClient: DynamoDBDocument;
};
class AuthController {
  private static dynamoDocClient: DynamoDBDocument;
  private static authTable: string = 'email-type';
  private static sessionCookieName: string = 'web.session';

  static init({ dynamoDocClient }: AuthControllerConfig) {
    this.dynamoDocClient = dynamoDocClient;
    const router = express.Router();
    router.post('/auth/signup', this.signup);
    router.get('/auth/verify-email', this.verifyEmailLink);
    router.post('/auth/login', this.login);
    router.post('/auth/logout', this.logout);
    router.post('/auth/logout/all', this.logoutAll);
    router.get('/auth/session', this.sessionInfo);
    router.post('/auth/forgot-password', this.forgotPassword);
    router.get('/auth/reset-password', this.resetPasswordEmailLink);
    router.post('/auth/reset-password', this.resetPassword);
    return router;
  }

  static createSession = async (email: string) => {
    const sessionToken = encrypt(email);
    const session: SessionRecord = {
      email,
      type: `SESSION#${sessionToken}`,
      createdAt: new Date().toISOString(),
      timeToLive: Math.floor(Date.now() / 1000) + _30_DAYS_SECONDS, // 30 days
    };
    await this.dynamoDocClient.put({
      TableName: this.authTable,
      Item: session,
    });
    return sessionToken;
  };

  static deleteSession = (sessionToken: string) => {
    const email = decrypt(sessionToken);
    void this.dynamoDocClient.delete({
      TableName: this.authTable,
      Key: { email: email, type: `SESSION#${sessionToken}` },
    });
  };

  static deleteAllSessions = async (email: string) => {
    const response = await this.dynamoDocClient.query({
      TableName: this.authTable,
      KeyConditionExpression: '#email = :email AND begins_with(#type, :prefix)',
      ExpressionAttributeValues: {
        ':email': email,
        ':prefix': 'SESSION#',
      },
      ExpressionAttributeNames: {
        '#email': 'email',
        '#type': 'type',
      },
    });
    const sessions = response.Items as SessionRecord[];
    const sessionChunks = lodashChunk(sessions, 25);
    for (const sessionChunk of sessionChunks) {
      await this.dynamoDocClient.batchWrite({
        RequestItems: {
          [this.authTable]: sessionChunk.map((session) => ({
            DeleteRequest: {
              Key: { email: email, type: session.type },
            },
          })),
        },
      });
    }
  };

  static signup = async (req: Request, res: Response) => {
    const { email, password, confirmPassword } = req.body as Partial<SignupRequest>;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const hashedPassword = await hashPassword(password);
    const emailVerifiedToken = encrypt(email);
    const user: UserRecord = {
      email,
      type: 'USER',
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      emailVerifiedToken,
      resetPasswordToken: null,
    };
    // Save new user
    try {
      await this.dynamoDocClient.put({
        TableName: this.authTable,
        Item: user,
        ConditionExpression: 'attribute_not_exists(#email)',
        ExpressionAttributeNames: { '#email': 'email' },
      });
    } catch (error) {
      res.status(400).json({ message: 'Server error' });
      return;
    }
    // send email with embedded verification token
    const { html, subject } = verifyEmail({ email, token: emailVerifiedToken });
    await sendEmail({ to: email, subject, html });
    // Create session
    const sessionToken = await this.createSession(email);
    res.cookie(this.sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: _30_DAYS_SECONDS * 1000,
    });
    res.json({ sessionToken });
  };

  static verifyEmailLink = async (req: Request, res: Response) => {
    const { email, token } = req.query as Partial<VerifyEmailRequest>;
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and token are required' });
    }
    await this.dynamoDocClient.update({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
      // check token is valid
      ConditionExpression: '#emailVerifiedToken = :token',
      // mark email as verified and clear token
      UpdateExpression: 'SET #emailVerified = :true, #emailVerifiedToken = :null',
      ExpressionAttributeValues: {
        ':token': token,
        ':true': true,
        ':null': null,
      },
      ExpressionAttributeNames: {
        '#emailVerified': 'emailVerified',
        '#emailVerifiedToken': 'emailVerifiedToken',
      },
    });
    // Create session
    const sessionToken = await this.createSession(email);
    res.cookie(this.sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: _30_DAYS_SECONDS * 1000,
    });
    res.redirect('/');
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body as Partial<LoginRequest>;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const response = await this.dynamoDocClient.get({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
    });
    const user = response.Item as UserRecord | undefined;
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const sessionToken = await this.createSession(email);
    res.cookie(this.sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: _30_DAYS_SECONDS * 1000,
    });
    res.json({ sessionToken });
  };

  static logout = (req: Request, res: Response) => {
    console.log(req.cookies);
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (req.cookies[this.sessionCookieName]) {
      this.deleteSession(cookieSessionToken);
      res.clearCookie(this.sessionCookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: _30_DAYS_SECONDS * 1000,
      });
    }
    res.json({});
  };

  static logoutAll = async (req: Request, res: Response) => {
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (cookieSessionToken) {
      const email = decrypt(cookieSessionToken);
      await this.deleteAllSessions(email);
      res.clearCookie(this.sessionCookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    res.json({});
  };

  static getSessionAndUser = async (sessionToken: string) => {
    const email = decrypt(sessionToken);
    const getUser = this.dynamoDocClient.get({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
    });
    const getSession = this.dynamoDocClient.get({
      TableName: this.authTable,
      Key: { email, type: `SESSION#${sessionToken}` },
    });
    const user = (await getUser).Item as UserRecord;
    const session = (await getSession).Item as SessionRecord;
    if (!user || !session) {
      return { user: null, session: null };
    }
    const safeUser: SafeUserRecord = lodashOmit(
      user,
      'passwordHash',
      'emailVerifiedToken',
      'resetPasswordToken',
    );
    return { user: safeUser, session };
  };

  static sessionInfo = async (req: Request, res: Response) => {
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (!cookieSessionToken) {
      return res.json({ user: null, session: null });
    }
    try {
      const { user, session } = await this.getSessionAndUser(cookieSessionToken);
      return res.json({ user, session });
    } catch (error) {
      return res.json({ user: null, session: null });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body as Partial<ForgotPasswordRequest>;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      const resetPasswordToken = encrypt(email!);
      await this.dynamoDocClient.update({
        TableName: this.authTable,
        Key: { email, type: 'USER' },
        ConditionExpression: 'attribute_exists(#email)',
        UpdateExpression: 'SET #resetPasswordToken = :resetPasswordToken',
        ExpressionAttributeValues: {
          ':resetPasswordToken': resetPasswordToken,
        },
        ExpressionAttributeNames: {
          '#resetPasswordToken': 'resetPasswordToken',
          '#email': 'email',
        },
      });
      // send email with embedded verification token
      const { html, subject } = forgotPassword({ email: email!, token: resetPasswordToken });
      await sendEmail({ to: email!, subject, html });
    } catch (error) {
      console.error(error);
      // ignore errors, provide consistent response to prevent hackers from scanning for valid emails
    } finally {
      res.json({});
    }
  };

  static resetPasswordEmailLink = async (req: Request, res: Response) => {
    const { email, token } = req.query as Partial<ResetPasswordRequest>;
    // TODO: Validate email and token and redirect to 404 page if invalid
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and token are required' });
    }
    const response = await this.dynamoDocClient.get({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
    });
    const user = response.Item as UserRecord | undefined;
    const isValidToken = user?.resetPasswordToken === token;
    if (!user || !isValidToken) {
      res.redirect('/error');
      return;
    }
    res.redirect(
      `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
    );
  };

  static resetPassword = async (req: Request, res: Response) => {
    const { email, token, password, confirmPassword } = req.body as Partial<ResetPasswordRequest>;
    if (!email || !token || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Email, token, password, and confirm password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const hashedPassword = await hashPassword(password);
    await this.dynamoDocClient.update({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
      // check token is valid
      ConditionExpression: 'attribute_exists(#email) AND #resetPasswordToken = :token',
      // set password hash and clear token
      UpdateExpression: 'SET #passwordHash = :passwordHash, #resetPasswordToken = :null',
      ExpressionAttributeValues: {
        ':passwordHash': hashedPassword,
        ':token': token,
        ':null': null,
      },
      ExpressionAttributeNames: {
        '#passwordHash': 'passwordHash',
        '#resetPasswordToken': 'resetPasswordToken',
        '#email': 'email',
      },
    });
    // Log the user out and clear all active sessions
    await this.deleteAllSessions(email);
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (cookieSessionToken) {
      res.clearCookie(this.sessionCookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    // Redirect to login page
    res.redirect('/login');
  };

  static authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (!cookieSessionToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const { user, session } = await this.getSessionAndUser(cookieSessionToken);
      if (!user || !session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!user.emailVerified) {
        return res.status(401).json({ message: 'Email not verified' });
      }
      res.locals.user = user;
      res.locals.session = session;
      next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

export default AuthController;
