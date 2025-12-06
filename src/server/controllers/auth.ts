import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import express, { Router, Request, Response } from 'express';

// import { hashPassword, verifyPassword, encrypt, decrypt } from '../helpers/session';
import { hashPassword, verifyPassword, encrypt, decrypt } from 'server/helpers/session';

type SignupRequest = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type LoginRequest = {
  email?: string;
  password?: string;
};

type AuthRecord = {
  PK: string;
  SK: string;
  passwordHash?: string;
  createdAt: string;
};

const _30_DAYS_SECONDS = 60 * 60 * 24 * 30;
class AuthController {
  private static dynamoDB: DynamoDB = new DynamoDB({ region: 'us-west-1' });
  private static dynamoDocClient: DynamoDBDocument;
  private static authTable: string = 'web-users.sessions';
  private static sessionCookieName: string = 'web.session';

  static init() {
    this.dynamoDocClient = DynamoDBDocument.from(this.dynamoDB);

    const router: Router = express.Router();
    router.post('/signup', this.signup);
    router.post('/login', this.login);
    router.post('/logout', this.logout);
    return router;
  }

  static createSession = async (res: Response, email: string) => {
    const sessionToken = encrypt(email);
    const session = {
      PK: email,
      SK: `SESSION#${sessionToken}`,
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
    void this.dynamoDocClient.delete({
      TableName: this.authTable,
      Key: { PK: email, SK: `SESSION#${sessionToken}` },
    });
  };

  static signup = async (req: Request, res: Response) => {
    const { email, password, confirmPassword } = req.body as SignupRequest;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const hashedPassword = await hashPassword(password);
    const user = {
      PK: email,
      SK: 'USER',
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    console.log(user);
    // Save new user
    await this.dynamoDocClient.put({
      TableName: this.authTable,
      Item: user,
      ConditionExpression: 'attribute_not_exists(#email)',
      ExpressionAttributeNames: { '#email': 'PK' },
    });
    // Create session
    const sessionToken = await this.createSession(res, email);
    res.json({ sessionToken });
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const response = await this.dynamoDocClient.get({
      TableName: this.authTable,
      Key: { PK: email, SK: 'USER' },
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
}

export default AuthController;
