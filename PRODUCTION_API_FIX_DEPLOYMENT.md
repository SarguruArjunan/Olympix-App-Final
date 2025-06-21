# Production API Fix Deployment Guide

## Issue Identified

The production API is failing with `FUNCTION_INVOCATION_FAILED` because:

1. Missing `package.json` in the `/api` directory
2. Incompatible TypeScript configuration for Vercel serverless functions

## Fixes Applied

### 1. Created `/api/package.json`

- Added proper dependencies for `@vercel/node`
- Set Node.js version to 18.x
- Included TypeScript development dependencies

### 2. Updated `/api/tsconfig.json`

- Changed module system from `esnext` to `commonjs`
- Removed JSX configuration (not needed for API)
- Optimized for serverless function deployment

### 3. Updated `/vercel.json`

- Added `includeFiles` to ensure all API files are properly bundled

## Deployment Steps

1. **Commit the changes:**

   ```bash
   git add .
   git commit -m "fix: Add missing API package.json and fix serverless function config"
   ```

2. **Deploy to Vercel:**

   ```bash
   npx vercel --prod
   ```

   Or if using Vercel CLI:

   ```bash
   vercel deploy --prod
   ```

3. **Verify the fix:**

   ```bash
   curl https://olympix-app-final.vercel.app/api/v1/health
   ```

   Expected response:

   ```json
   {
     "success": true,
     "message": "API is running successfully",
     "status": "healthy",
     "timestamp": "...",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

## Testing Additional Endpoints

After successful deployment, test these endpoints:

- **Sports:** `curl https://olympix-app-final.vercel.app/api/v1/sports`
- **Teams:** `curl https://olympix-app-final.vercel.app/api/v1/teams`
- **Medals:** `curl https://olympix-app-final.vercel.app/api/v1/medals`
- **Players:** `curl https://olympix-app-final.vercel.app/api/v1/players`
- **Schedules:** `curl https://olympix-app-final.vercel.app/api/v1/schedules`

## Root Cause

The original issue was that Vercel's serverless function runtime couldn't find the required dependencies because there was no `package.json` file in the API directory. Vercel requires each serverless function to have its own dependency manifest.

## Prevention

- Always include `package.json` in serverless function directories
- Use CommonJS module system for Vercel Node.js functions
- Test API endpoints after each deployment

## Rollback Plan

If the deployment fails:

1. Revert the changes: `git revert HEAD`
2. Deploy the previous version: `npx vercel --prod`
3. Debug using Vercel function logs: `npx vercel logs`
