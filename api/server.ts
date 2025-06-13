// Simple health check API for production
export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // For now, return a message indicating backend is not deployed
  res.status(503).json({
    success: false,
    error: 'Backend API is not deployed yet. Please deploy the backend to a separate Vercel project or configure serverless functions.',
    message: 'This is a placeholder API endpoint. The frontend will show sample data when the API is unavailable.',
    timestamp: new Date().toISOString()
  });
}