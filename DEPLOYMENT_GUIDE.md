# Deployment Troubleshooting Guide

## Issue: Production Build Failure with react-dom/client

### Problem

The application builds successfully locally but fails during production deployment with the error:

```
Module not found: Error: Can't resolve 'react-dom/client' in '/vercel/path0/frontend/src'
```

### Root Cause

The issue was caused by version incompatibilities between:

1. React 19.x and react-scripts 5.0.1
2. Inconsistent Node.js versions between local and production environments
3. Missing deployment configuration for Vercel

### Solution Applied

#### 1. Downgraded React to Compatible Version

- Changed React from 19.1.0 to 18.3.1
- Updated @types/react and @types/react-dom to 18.x versions
- This ensures compatibility with react-scripts 5.0.1

#### 2. Node.js Version Consistency

- Added `.nvmrc` files specifying Node.js 18.19.0
- Added `.node-version` file for platform compatibility
- Updated package.json with engines specification

#### 3. Vercel Configuration

- Created `vercel.json` with proper build configuration
- Specified Node.js runtime version
- Set up proper build commands and environment variables

#### 4. Dependency Management

- Used `npm ci` for consistent dependency installation
- Added registry specification in .npmrc

### Files Created/Modified

#### New Files:

- `vercel.json` - Vercel deployment configuration
- `.nvmrc` - Node.js version specification
- `frontend/.nvmrc` - Frontend-specific Node.js version
- `frontend/.node-version` - Alternative Node.js version file
- `frontend/build.sh` - Production build script
- `DEPLOYMENT_GUIDE.md` - This documentation

#### Modified Files:

- `frontend/package.json` - Added engines specification
- Dependencies downgraded to React 18.x

### Deployment Steps

1. **Local Testing:**

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Vercel Deployment:**

   - The `vercel.json` configuration will handle the build process
   - Ensure all files are committed to the repository
   - Vercel will use Node.js 18.19.0 as specified

3. **Alternative Build Script:**
   ```bash
   cd frontend
   ./build.sh
   ```

### Key Configuration Details

#### vercel.json

- Uses simplified configuration for React apps
- Specifies Node.js 18.19.0 environment
- Sets proper build, install, and output commands
- Configures environment variables
- Removes conflicting `builds` and `functions` properties

#### package.json engines

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Verification

The build now works successfully both locally and should work in production with:

- React 18.3.1 compatibility
- Consistent Node.js 18.19.0 environment
- Proper Vercel configuration

## Additional Production Issue: Sports Icons Not Displaying

### Problem

Sports icons appear correctly in local development but fail to load in production deployment.

### Root Cause

**Case sensitivity mismatch**:

- Data URLs used `/icons/` (lowercase)
- Actual folder structure: `/Icons/` (uppercase I)
- Works on macOS (case-insensitive) but fails on Linux production servers (case-sensitive)

### Solution Applied

#### 1. Fixed Data Source

- Updated [`data/sample-sports.json`](data/sample-sports.json:1) to use correct case `/Icons/`
- Reinitialized backend Excel data with corrected paths

#### 2. Enhanced IconImage Component

- Added intelligent fallback logic in [`frontend/src/components/IconImage.tsx`](frontend/src/components/IconImage.tsx:1)
- Automatically tries alternative case if first attempt fails
- Provides graceful fallback to default icon if both cases fail

#### 3. Production Compatibility

- Icons now work consistently across all environments
- Handles both case-sensitive and case-insensitive file systems

### Future Considerations

- Monitor React 19 compatibility with react-scripts
- Consider upgrading to newer build tools (Vite, etc.) for React 19 support
- Regular dependency updates with compatibility testing
- Always use consistent case for asset paths in cross-platform deployments
