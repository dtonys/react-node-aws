import express, { Request, Response, Router } from 'express';

// API Routes
const apiRoutes: Router = express.Router();

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

export default apiRoutes;

