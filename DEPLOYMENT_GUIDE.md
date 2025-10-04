# NASA Bioscience Explorer - Deployment Guide

This guide provides detailed instructions for deploying the NASA Bioscience Explorer to various cloud platforms.

## Quick Fix Summary

The main deployment issues were caused by:

1. **File System Dependencies**: The original code relied on direct file system access to the `SB_publications-main` folder
2. **Platform Differences**: Different platforms handle file paths and permissions differently
3. **Missing Fallback Data**: No fallback mechanism when data files weren't accessible

## Solutions Implemented

✅ **Environment Detection**: Automatic detection of deployment platform
✅ **Fallback Data System**: Sample data when filesystem isn't accessible
✅ **Safe File Operations**: Error-handling for file system operations
✅ **Platform-Specific Configuration**: Configuration files for different platforms
✅ **Robust API Routes**: APIs that gracefully handle missing data files

## Platform-Specific Deployment

### 1. Vercel (Recommended)

Vercel works well with Next.js applications:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables for Vercel:**
- `NODE_ENV=production`
- `DEPLOYMENT_PLATFORM=vercel`
- `DATA_SOURCE=filesystem` (or `fallback` if data isn't accessible)

### 2. Render

1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration file
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Set environment variables:
   - `NODE_ENV=production`
   - `DEPLOYMENT_PLATFORM=render`
   - `DATA_SOURCE=filesystem`

**Manual Environment Variables in Render Dashboard:**
```
NODE_ENV=production
DEPLOYMENT_PLATFORM=render
DATA_SOURCE=filesystem
ENABLE_ML_FEATURES=true
ENABLE_3D_VISUALIZATION=true
CACHE_DURATION=600000
```

### 3. Replit

1. Import your GitHub repository into Replit
2. The `.replit` and `replit.nix` files are automatically used
3. Ensure the `SB_publications-main` folder is included in the import
4. Run with `npm run dev` for development or `npm start` for production

**Environment Variables (set in Replit Secrets):**
- `NODE_ENV=production`
- `DEPLOYMENT_PLATFORM=replit`
- `DATA_SOURCE=filesystem`

### 4. Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Next.js application
3. Set environment variables in Railway dashboard:

```env
NODE_ENV=production
DEPLOYMENT_PLATFORM=railway
DATA_SOURCE=filesystem
ENABLE_ML_FEATURES=true
ENABLE_3D_VISUALIZATION=true
```

### 5. Netlify (with Adapter)

For Netlify, you'll need to add the Next.js adapter:

```bash
npm install @netlify/plugin-nextjs
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_ENV = "production"
  DEPLOYMENT_PLATFORM = "netlify"
  DATA_SOURCE = "filesystem"
```

## Troubleshooting Common Issues

### Issue 1: "Summary CSV not found"

**Solution**: The API routes now automatically fall back to sample data:

```typescript
// This is now handled automatically in the API routes
const dataSource = getDataSource();
if (dataSource === 'fallback') {
  console.log('Using fallback data - filesystem not accessible');
  return fallbackData;
}
```

### Issue 2: File System Permissions

**Solution**: Use the `safeReadFile` utility that handles errors gracefully:

```typescript
const content = safeReadFile(filePath);
if (content) {
  // Process content
} else {
  // Handle missing file
}
```

### Issue 3: Build Failures

**Common Causes & Solutions:**

1. **Missing Node.js Version**: Ensure Node.js 18+ is specified in `package.json`
2. **TypeScript Errors**: Run `npm run type-check` locally first
3. **Memory Issues**: Increase build memory if needed
4. **Dependency Issues**: Clear node_modules and reinstall

### Issue 4: API Routes Not Working

**Check These Steps:**

1. Verify all API routes are in the `app/api/` directory
2. Check server logs for detailed error messages
3. Test with fallback data by setting `DATA_SOURCE=fallback`
4. Verify environment variables are set correctly

## Environment Variables Reference

### Required Variables
```env
NODE_ENV=production
DEPLOYMENT_PLATFORM=render|vercel|replit|railway|netlify
```

### Optional Variables
```env
# Data source strategy
DATA_SOURCE=filesystem|fallback

# Feature toggles
ENABLE_ML_FEATURES=true|false
ENABLE_3D_VISUALIZATION=true|false
ENABLE_FILE_UPLOAD=true|false

# Performance settings
API_RATE_LIMIT=60
CACHE_DURATION=600000

# Debug mode
DEBUG_MODE=false

# OpenAI integration (optional)
OPENAI_API_KEY=your_api_key_here
```

## Data Management

### With Real Data (`SB_publications-main` folder)

Ensure the `SB_publications-main` folder is included in your deployment:

1. **Check .gitignore**: Make sure it's not ignored
2. **Verify Upload**: Confirm the folder is in your repository
3. **File Permissions**: Ensure read permissions are set
4. **Path Resolution**: The application uses `process.cwd()` for path resolution

### With Fallback Data

If the data folder isn't accessible, the application automatically uses sample data:

- 5 sample research articles
- Complete metadata and statistics
- Full functionality maintained
- Search and filtering still work

## Performance Optimization

### 1. Caching Strategy

- Articles: 10-minute cache
- Publications: 10-minute cache  
- Statistics: 5-minute cache

### 2. Build Optimization

```bash
# Analyze bundle size
npm run analyze

# Type checking
npm run type-check

# Build for production
npm run build
```

### 3. Memory Management

For platforms with memory constraints:
- Reduce article limit in API calls
- Implement pagination
- Optimize image assets
- Use lazy loading for components

## Testing Deployment

### Local Testing
```bash
# Test production build locally
npm run build
npm start

# Test with fallback data
DATA_SOURCE=fallback npm start
```

### API Endpoints to Test
- `GET /api/stats` - Should return statistics
- `GET /api/articles` - Should return article list
- `GET /api/publications` - Should return publications
- `GET /api/insights` - Should return AI insights

### Health Check
The application includes a health check endpoint at `/api/stats` that can be used by deployment platforms.

## Support

If you encounter deployment issues:

1. Check the deployment logs for detailed error messages
2. Test locally with the same environment variables
3. Verify all required files are in the repository
4. Use fallback data mode to isolate file system issues
5. Check the console for deployment information logs

The application is designed to be resilient and will fall back to sample data if the original data files aren't accessible, ensuring your deployment will work even with data access issues.