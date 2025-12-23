import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Request, Response, NextFunction } from 'express';

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

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json(serializeError(err));
}
