import express from 'express';
import cors from 'cors';
import { join } from 'path';
import sportsRouter from './routes/sports';
import schedulesRouter from './routes/schedules';
import medalsRouter from './routes/medals';
import teamsRouter from './routes/teams';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Constants
export const DATA_DIR = join(__dirname, '../../data');
export const EXCEL_FILE = join(DATA_DIR, 'EventData.xlsx');

// Routes
app.use('/api/v1/sports', sportsRouter);
app.use('/api/v1/schedules', schedulesRouter);
app.use('/api/v1/medals', medalsRouter);
app.use('/api/v1/teams', teamsRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;