// API Configuration - Environment aware
const getApiBaseUrl = (): string => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';
  }
  
  // In production, try to use environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // For Netlify production - use relative URLs that will be redirected to functions
  const currentDomain = window.location.origin;
  return `${currentDomain}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();

// Query stale times (in milliseconds)
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const QUERY_GC_TIME = 1000 * 60 * 30; // 30 minutes

// UI Constants
export const MEDAL_COLORS = {
  GOLD: 'text-yellow-600',
  SILVER: 'text-gray-500', 
  BRONZE: 'text-orange-600'
} as const;

// Loading spinner sizes
export const SPINNER_SIZES = {
  SMALL: 'h-6 w-6',
  MEDIUM: 'h-12 w-12',
  LARGE: 'h-16 w-16'
} as const;

// Date format options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit'
}; 