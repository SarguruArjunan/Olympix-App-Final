import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check API for production
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint - return success for basic connectivity
  if (req.url?.includes('/health') || req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'API is running successfully',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'production'
    });
    return;
  }

  // For other endpoints, return placeholder response
  res.status(200).json({
    success: false,
    message: 'This is a placeholder API endpoint. The frontend will show sample data when full backend is unavailable.',
    availableEndpoints: [
      'GET /api/v1/health - Health check',
      'GET /api/v1/* - Placeholder responses'
    ],
    timestamp: new Date().toISOString()
  });
}