import express, { Request, Response, Application, Router } from 'express';

const app: Application = express();

// Routes
const router: Router = express.Router();


// Root endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'web-2026' });
});

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', router);

console.log('Server starting...');

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
