import app from './app';
import { JsonService } from './services/json.service';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Validate JSON data files before starting
    console.log('🔍 Validating JSON data files...');
    const isValid = await JsonService.validateDataFiles();
    
    if (!isValid) {
      console.error('❌ JSON data files validation failed. Please check your data files.');
      process.exit(1);
    }
    
    console.log('✅ JSON data files validation passed');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Using JSON-based data storage`);
      console.log(`📁 Data directory: ${require('path').join(__dirname, '../data')}`);
      
      // Display storage configuration
      JsonService.logStorageInfo();
      
      console.log(`🌐 Server ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();