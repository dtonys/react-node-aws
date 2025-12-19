import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import express, { NextFunction, Request, Response, Router } from 'express';

import AuthController from './controllers/auth';
import { addDevLoggerMiddleware } from './helpers/dynamo';

// API Routes
const apiRoutes: Router = express.Router();

// Setup DynamoDB clients
const dynamoDB = new DynamoDB();
const dynamoDocClient = DynamoDBDocument.from(dynamoDB, {
  marshallOptions: { removeUndefinedValues: true },
});
if (process.env.NODE_ENV === 'development') {
  addDevLoggerMiddleware(dynamoDocClient);
}

apiRoutes.use(AuthController.init({ dynamoDocClient }));

// Root endpoint
apiRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'web-2026' });
});

apiRoutes.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRoutes.post('/echo', (req: Request, res: Response) => {
  res.json(req.body);
});

function serializeError(err: unknown) {
  if (process.env.NODE_ENV === 'production') return { message: 'Internal server error' };
  if (!(err instanceof Error)) return { message: String(err) };
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...Object.fromEntries(Object.entries(err)), // include custom props
  };
}
apiRoutes.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json(serializeError(err));
});

export default apiRoutes;
