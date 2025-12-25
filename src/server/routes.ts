import express, { Request, Response, Router } from 'express';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

import AuthController from './controllers/auth';
import UploadsController from './controllers/uploads';
import DictionaryController from './controllers/dictionary';
import SessionHistoryController from './controllers/sessionHistory';
import { addDevLoggerMiddleware } from './helpers/dynamo';
import { createOpenSearchClient } from './helpers/opensearch';
import { errorHandler } from './helpers/middleware';

// API Routes
const apiRoutes: Router = express.Router();

// Setup AWS clients
const dynamoDB = new DynamoDB();
const dynamoDocClient = DynamoDBDocument.from(dynamoDB, {
  marshallOptions: { removeUndefinedValues: true },
});
if (process.env.NODE_ENV === 'development') {
  addDevLoggerMiddleware(dynamoDocClient);
}
const s3Client = new S3Client();
const opensearchClient = process.env.OPENSEARCH_ENDPOINT ? createOpenSearchClient() : null;

apiRoutes.use(AuthController.init({ dynamoDocClient }));
apiRoutes.use(UploadsController.init({ s3Client }));
if (opensearchClient) {
  apiRoutes.use(DictionaryController.init({ opensearchClient }));
}
if (process.env.REDIS_URL) {
  apiRoutes.use(SessionHistoryController.init());
}

// Root endpoint
apiRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'react-node-aws' });
});

apiRoutes.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRoutes.post('/echo', (req: Request, res: Response) => {
  res.json(req.body);
});

apiRoutes.use(errorHandler);

export default apiRoutes;
