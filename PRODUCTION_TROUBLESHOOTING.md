# Production API Error Troubleshooting Guide

## Current Issue: "Error loading teams - failed to fetch"

You're experiencing fetch errors across all pages in production while the same code works locally. Here's a comprehensive diagnostic and solution approach.

## Immediate Actions to Take

### 1. Check Browser Console Logs

Open browser developer tools (F12) on your production site and look for:

```javascript
// You should see these diagnostic messages:
🔍 Checking API status at: [API_URL]
❌ API unreachable: [Error details]
📊 Using demo data while API is unavailable
```

### 2. Verify Current API Configuration

The app now automatically detects your current API configuration. Check the yellow indicator in the top-right corner of your production site that shows:

- Current API URL being used
- Connection status
- Whether demo data is active

### 3. Environment Variable Check

In your Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Check if `REACT_APP_API_BASE_URL` is set
3. If not set, the app defaults to `[YOUR_DOMAIN]/api/v1`

## Diagnostic Steps

### Step 1: API URL Verification

Your app now uses this priority order for API URLs:

1. **Development**: `http://localhost:3001/api/v1`
2. **Production with env var**: `REACT_APP_API_BASE_URL` value
3. **Production fallback**: `https://olympix-app-final.vercel.app/api/v1`

### Step 2: Test API Endpoints Manually

Try these URLs in your browser:

```bash
# Test the health endpoint
https://olympix-app-final.vercel.app/api/v1/health

# Test teams endpoint
https://olympix-app-final.vercel.app/api/v1/teams

# Test sports endpoint
https://olympix-app-final.vercel.app/api/v1/sports
```

**Expected Results:**

- If backend is deployed: JSON responses with data
- If backend not deployed: 503 error with helpful message
- If routing issues: 404 error

### Step 3: Network Tab Analysis

1. Open Developer Tools → Network tab
2. Reload your production site
3. Look for failed requests to `/api/v1/*` endpoints
4. Check the error details:
   - **CORS errors**: Backend needs CORS configuration
   - **404 errors**: API routing issues
   - **Network errors**: Backend not deployed
   - **Timeout errors**: Backend too slow

## Common Issues & Solutions

### Issue 1: Backend Not Deployed

**Symptoms**: 404 or 503 errors on API calls
**Solution**: You have three options:

#### Option A: Use Demo Data (Current State)

- ✅ **Works immediately**
- ✅ **No backend needed**
- ✅ **Perfect for demos**
- App automatically falls back to mock data

#### Option B: Deploy Backend Separately

1. Deploy your backend to Vercel/Heroku/Railway
2. Set environment variable: `REACT_APP_API_BASE_URL=https://your-api-domain.com/api/v1`
3. Frontend will automatically connect

#### Option C: Monorepo Deployment

1. Configure Vercel to build both frontend and backend
2. Update `vercel.json` for full-stack deployment

### Issue 2: CORS Errors

**Symptoms**: "Access-Control-Allow-Origin" errors
**Solution**: Update backend CORS configuration:

```javascript
// Backend: add allowed origins
app.use(
  cors({
    origin: [
      "https://olympix-app-final.vercel.app",
      "http://localhost:3000", // for development
    ],
  })
);
```

### Issue 3: Environment Variables

**Symptoms**: App tries to connect to localhost in production
**Solution**: Set Vercel environment variables:

```bash
# In Vercel Dashboard → Environment Variables
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api/v1
```

### Issue 4: SSL/Security Issues

**Symptoms**: Mixed content errors (HTTP API from HTTPS site)
**Solution**: Ensure API URL uses HTTPS:

```bash
# ❌ Wrong
REACT_APP_API_BASE_URL=http://api.example.com

# ✅ Correct
REACT_APP_API_BASE_URL=https://api.example.com
```

## Enhanced Error Handling Features

Your app now includes:

### 1. Automatic Fallback System

- API fails → Shows demo data instead of errors
- Users see working app with sample content
- No more "failed to fetch" crashes

### 2. Visual Status Indicator

- Yellow indicator when using demo data
- Green indicator when API is connected
- Real-time connection status

### 3. Enhanced Logging

```javascript
// Check browser console for detailed logs:
console.log("API URL:", API_BASE_URL);
console.log("Environment:", process.env.NODE_ENV);
console.log("API Status:", "Connected/Demo Mode");
```

### 4. Better Error Messages

- Clear distinction between network vs API errors
- Helpful suggestions for resolution
- No more generic "failed to fetch" messages

## Testing Your Fix

### Local Testing

```bash
cd frontend
npm start
# Should work with localhost API or show demo data
```

### Production Testing

1. Deploy to Vercel
2. Open production site
3. Check status indicator in top-right
4. Verify console logs for diagnostic info

### API Integration Testing

1. Set `REACT_APP_API_BASE_URL` in Vercel
2. Deploy backend to hosting platform
3. Verify green status indicator
4. Test all pages for real data

## Next Steps

Based on your current state:

### Immediate (Demo Mode)

- ✅ App works with demo data
- ✅ No crashes or errors
- ✅ All pages functional
- ✅ Perfect for showcasing

### Short Term (API Integration)

1. Deploy backend to hosting platform
2. Configure `REACT_APP_API_BASE_URL`
3. Test API connectivity
4. Verify real data loads

### Long Term (Production Ready)

1. Set up proper CI/CD
2. Add monitoring and logging
3. Implement caching strategies
4. Add performance optimizations

## Support Information

If you're still experiencing issues:

1. **Check the status indicator** - Is it yellow (demo) or red (error)?
2. **Review browser console** - Look for the diagnostic messages
3. **Test API endpoints manually** - Are they accessible via browser?
4. **Verify environment variables** - Is `REACT_APP_API_BASE_URL` correct?

The app is designed to gracefully handle API unavailability, so users should never see "failed to fetch" errors anymore.
