import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import express, { Router, Request, Response } from 'express';
import lodashOmit from 'lodash/omit';

import { hashPassword, verifyPassword, encrypt, decrypt } from 'server/helpers/session';
import { SignupRequest, LoginRequest, AuthRecord } from 'shared/types/auth';

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

    const router: Router = express.Router();
    router.post('/signup', this.signup);
    router.post('/login', this.login);
    router.post('/logout', this.logout);
    router.get('/session', this.sessionInfo);
    return router;
  }

  static createSession = async (res: Response, email: string) => {
    const sessionToken = encrypt(email);
    const session = {
      email,
      type: `SESSION#${sessionToken}`,
      createdAt: new Date().toISOString(),
      timeToLive: Math.floor(Date.now() / 1000) + _30_DAYS_SECONDS, // 30 days
    };
    await this.dynamoDocClient.put({
      TableName: this.authTable,
      Item: session,
    });
    res.cookie(this.sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: _30_DAYS_SECONDS * 1000,
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
    const user = {
      email,
      type: 'USER',
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    // Save new user
    await this.dynamoDocClient.put({
      TableName: this.authTable,
      Item: user,
      ConditionExpression: 'attribute_not_exists(#email)',
      ExpressionAttributeNames: { '#email': 'email' },
    });
    // Create session
    const sessionToken = await this.createSession(res, email);
    res.json({ sessionToken });
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
    const user = response.Item as AuthRecord | undefined;
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isValid = await verifyPassword(password, user.passwordHash!);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const sessionToken = await this.createSession(res, email);
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
      return res.json({
        user: lodashOmit(user, 'passwordHash'),
        session: lodashOmit(session, 'timeToLive'),
      });
    } catch (error) {
      return res.json({ user: null, session: null });
    }
  };
}

export default AuthController;
