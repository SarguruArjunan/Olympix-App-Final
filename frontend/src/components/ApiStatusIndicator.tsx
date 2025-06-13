import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';

interface ApiStatus {
  url: string;
  isReachable: boolean;
  error?: string;
  responseTime?: number;
}

const ApiStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>({
    url: API_BASE_URL,
    isReachable: false,
  });

  useEffect(() => {
    const checkApiStatus = async () => {
      const startTime = Date.now();
      
      try {
        console.log(`🔍 Checking API status at: ${API_BASE_URL}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          setStatus({
            url: API_BASE_URL,
            isReachable: true,
            responseTime,
          });
          console.log(`✅ API is reachable (${responseTime}ms)`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`❌ API unreachable: ${error}`);
        
        setStatus({
          url: API_BASE_URL,
          isReachable: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime,
        });
      }
    };

    checkApiStatus();
  }, []);

  // Only show in development or when there are issues
  if (process.env.NODE_ENV === 'production' && status.isReachable) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-sm ${
      status.isReachable ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-400'
    } border`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          status.isReachable ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <span className="font-medium text-sm">
          {status.isReachable ? 'API Connected' : 'Using Demo Data'}
        </span>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <div>URL: {status.url}</div>
        {status.responseTime && <div>Response: {status.responseTime}ms</div>}
        {status.error && (
          <div className="text-red-600 mt-1">
            Error: {status.error}
          </div>
        )}
        {!status.isReachable && (
          <div className="text-blue-600 mt-1">
            📊 Showing demo data while API is unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatusIndicator;