import express, { NextFunction, Request, Response, Router } from 'express';

import AuthController from './controllers/auth';

// API Routes
const apiRoutes: Router = express.Router();

apiRoutes.use('/auth', AuthController.init());

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
