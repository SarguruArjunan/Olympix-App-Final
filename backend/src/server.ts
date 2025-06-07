import app from './app';
import { ExcelService } from './services/excel.service';
import initializeData from './utils/initializeData';
import { promises as fs } from 'fs';
import { DATA_DIR } from './app';

const PORT = process.env.PORT || 3001;

async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    console.log('Creating data directory...');
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function startServer() {
  try {
    // Ensure data directory exists
    await ensureDataDirectory();
    console.log('Data directory checked');

    // Initialize Excel workbook with required sheets
    await ExcelService.initializeWorkbook();
    console.log('Excel workbook initialized successfully');

    // Initialize sample data
    await initializeData();
    console.log('Sample data loaded successfully');

    // Start server only after successful initialization
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Available API endpoints:');
      console.log('- GET    /api/v1/sports');
      console.log('- GET    /api/v1/sports/:id');
      console.log('- POST   /api/v1/sports');
      console.log('- PUT    /api/v1/sports/:id');
      console.log('- DELETE /api/v1/sports/:id');
      console.log('- GET    /api/v1/medals');
      console.log('- GET    /api/v1/medals/:id');
      console.log('- POST   /api/v1/medals');
      console.log('- PUT    /api/v1/medals/:id');
      console.log('- DELETE /api/v1/medals/:id');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Error code:', (error as NodeJS.ErrnoException).code);
      }
    }
    process.exit(1);
  }
}

// Handle any unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

startServer();