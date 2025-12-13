import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import express, { Router, Request, Response } from 'express';
import lodashOmit from 'lodash/omit';

import { hashPassword, verifyPassword, encrypt, decrypt } from 'server/helpers/session';
import {
  SignupRequest,
  LoginRequest,
  UserRecord,
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
    console.log('deleting session', {
      email: email,
      type: `SESSION#${sessionToken}`,
    });
    void this.dynamoDocClient.delete({
      TableName: this.authTable,
      Key: { email: email, type: `SESSION#${sessionToken}` },
    });
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
    // send email with embedded verification token
    const { html, subject } = verifyEmail({ email, token: emailVerifiedToken });
    await sendEmail({ to: email, subject, html });

    // Save new user
    await this.dynamoDocClient.put({
      TableName: this.authTable,
      Item: user,
      ConditionExpression: 'attribute_not_exists(#email)',
      ExpressionAttributeNames: { '#email': 'email' },
    });
    // Create session
    const sessionToken = await this.createSession(email);
    res.cookie(this.sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: _30_DAYS_SECONDS * 1000,
    });
    res.json({ sessionToken });
  };

  static verifyEmail = async (req: Request, res: Response) => {
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
    }
    res.json({});
  };

  static sessionInfo = async (req: Request, res: Response) => {
    const cookieSessionToken = req.cookies[this.sessionCookieName];
    if (!cookieSessionToken) {
      return res.json({ user: null, session: null });
    }
    try {
      const email = decrypt(cookieSessionToken);
      const getUser = this.dynamoDocClient.get({
        TableName: this.authTable,
        Key: { email, type: 'USER' },
      });
      const getSession = this.dynamoDocClient.get({
        TableName: this.authTable,
        Key: { email, type: `SESSION#${cookieSessionToken}` },
      });
      const [{ Item: user }, { Item: session }] = await Promise.all([getUser, getSession]);
      if (!user || !session) {
        return res.json({ user: null, session: null });
      }
      const userRecord = user as UserRecord;
      const sessionRecord = session as SessionRecord;
      return res.json({
        user: lodashOmit(userRecord, 'passwordHash', 'emailVerifiedToken', 'resetPasswordToken'),
        session: lodashOmit(sessionRecord, 'timeToLive'),
      });
    } catch (error) {
      return res.json({ user: null, session: null });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body as Partial<ForgotPasswordRequest>;
      const resetPasswordToken = encrypt(email!);
      await this.dynamoDocClient.update({
        TableName: this.authTable,
        Key: { email, type: 'USER' },
        UpdateExpression: 'SET #resetPasswordToken = :resetPasswordToken',
        ExpressionAttributeValues: {
          ':resetPasswordToken': resetPasswordToken,
        },
        ExpressionAttributeNames: {
          '#resetPasswordToken': 'resetPasswordToken',
        },
      });
      // send email with embedded verification token
      const { html, subject } = forgotPassword({ email: email!, token: resetPasswordToken });
      await sendEmail({ to: email!, subject, html });
    } catch (error) {
      // ignore errors, provide consistent response to prevent hackers from scanning for valid emails
    } finally {
      res.json({});
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    const { email, token, password, confirmPassword } = req.body as Partial<ResetPasswordRequest>;
    if (!email || !token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email, token, password, and confirm password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const hashedPassword = await hashPassword(password);
    await this.dynamoDocClient.update({
      TableName: this.authTable,
      Key: { email, type: 'USER' },
      // check token is valid
      ConditionExpression: '#resetPasswordToken = :token',
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
      },
    });
    res.json({});
  };
}

export default AuthController;
