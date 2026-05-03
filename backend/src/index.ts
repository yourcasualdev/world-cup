import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { startCronJobs } from './jobs/cron';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const prisma = new PrismaClient();

app.use(cors({
  origin: ['https://worldcup.yourcasual.dev', 'https://api-worldcup.yourcasual.dev'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// Arka plan işlerini (Cron Jobs) başlat
startCronJobs();

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/status', async (req: Request, res: Response) => {
  try {
    // Simple DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', details: (error as Error).message });
  }
});

// Setup routes
import matchRoutes from './routes/matchRoutes';
import standingRoutes from './routes/standingRoutes';
import teamRoutes from './routes/teamRoutes';

app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/standings', standingRoutes);
app.use('/api/v1/teams', teamRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
