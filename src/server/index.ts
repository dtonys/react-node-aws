import path from 'node:path';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { loadSecrets } from './helpers/secrets';
import dotenv from 'dotenv';
import { setEncryptionKey } from './helpers/session';

// Setup express app
dotenv.config();
const app: Application = express();

const publicDir = path.join(__dirname, '../public');
app.use(express.json());
app.use(express.static(publicDir));
app.use(cookieParser());
app.use('/api', apiRoutes);
app.get('/*all-routes', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
async function bootstrap() {
  const encryptionKey = await loadSecrets();
  setEncryptionKey(encryptionKey);
  console.log('Server starting...');
  app.listen(3000, () => {
    console.log(`Server is running on port 3000 in ${process.env.NODE_ENV} mode`);
  });
}
void bootstrap();
