import express from 'express';
import cors from 'cors';
import { join } from 'path';
import sportsRouter from './routes/sports';
import schedulesRouter from './routes/schedules';
import medalsRouter from './routes/medals';
import teamsRouter from './routes/teams';
import playersRouter from './routes/players';

const app = express();

// Middleware - Configure CORS for production
app.use(cors({
  origin: [
    'https://olympix-app-final.vercel.app',
    'http://localhost:3000', // for development
  ],
  credentials: true
}));
// Increase payload size limit to handle base64 image uploads (10MB limit)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Add request logging for debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Data directory path
export const DATA_DIR = join(__dirname, '../data');
export const EXCEL_FILE = join(DATA_DIR, 'EventData.xlsx');

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ 
    name: 'Olympix API', 
    version: '1.0.0', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for frontend status monitoring
app.get('/api/v1/health', (_req, res) => {
  res.json({
    name: 'Olympix API',
    version: '1.0.0',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/sports', sportsRouter);
app.use('/api/v1/teams', teamsRouter);
app.use('/api/v1/schedules', schedulesRouter);
app.use('/api/v1/medals', medalsRouter);
app.use('/api/v1/players', playersRouter);

export default app;