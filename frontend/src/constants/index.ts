// API Configuration
export const API_BASE_URL = 'http://localhost:3001/api/v1';

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