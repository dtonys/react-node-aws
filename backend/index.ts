import path from 'node:path';
import express, { Application, Request, Response } from 'express';
import apiRoutes from './routes';

const app: Application = express();

const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));
app.use('/api', apiRoutes);

console.log(publicDir);

app.get('/*all-routes', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

console.log('Server starting...');
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
