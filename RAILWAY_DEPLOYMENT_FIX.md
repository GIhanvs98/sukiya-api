# Railway Deployment Fix

## Issue
Railway deployment was failing with a containerd snapshotter error:
```
ctrd: failed to pull image: failed to prepare extraction snapshot
```

This is typically an infrastructure issue on Railway's side, but we've added configuration files to help Railway build and deploy your application more reliably.

## Files Created

1. **`Dockerfile`** - Custom Docker build configuration that bypasses Railpack
2. **`railway.toml`** - Railway configuration file (preferred format)
3. **`railway.json`** - Alternative Railway configuration file
4. **`.dockerignore`** - Excludes unnecessary files from Docker build
5. **`.railwayignore`** - Excludes unnecessary files from Railway build

## Monorepo Setup

If you're deploying from the monorepo root (`miraisei`), you have two options:

1. **Set Service Root Directory** (Recommended):
   - In Railway service settings, set the "Root Directory" to `sukiya-api`
   - This tells Railway to treat `sukiya-api` as the project root
   - The Dockerfile will be found automatically

2. **Deploy from sukiya-api directory**:
   - Create a separate Railway service that points directly to the `sukiya-api` folder
   - Or use Railway's monorepo support to deploy only the `sukiya-api` service

## Next Steps

### Option 1: Use Dockerfile (Recommended)
1. In your Railway project settings, ensure the build method is set to use Dockerfile
2. Railway should automatically detect the `Dockerfile` in the root of your `sukiya-api` directory
3. If not detected automatically:
   - Go to your Railway service settings
   - Under "Build" section, select "Dockerfile" as the builder
   - Set the Dockerfile path to `Dockerfile` (or `sukiya-api/Dockerfile` if deploying from monorepo root)

### Option 2: Force Railway to Use Dockerfile
If Railway is still using Railpack:
1. Go to your Railway project dashboard
2. Navigate to your service settings
3. In the "Build" section, explicitly select "Dockerfile" instead of "Nixpacks" or "Railpack"
4. Redeploy

### Option 3: Try Different Region
The error occurred in `us-west1`. You can try:
1. Go to Railway project settings
2. Change the region to a different one (e.g., `us-east-1`, `eu-west-1`)
3. Redeploy

### Option 4: Contact Railway Support
If the issue persists, this appears to be an infrastructure issue on Railway's side. Contact Railway support with:
- The error message
- Your project/service ID
- The region where it failed

## Environment Variables Required

Make sure these are set in Railway:
- `PORT` - Railway sets this automatically, but your app uses it
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `LINE_CHANNEL_ACCESS_TOKEN` (optional) - For LINE integration
- `LINE_CHANNEL_SECRET` (optional) - For LINE integration
- `NODE_ENV` - Set to `production` for production deployments

## Verification

After deployment, check:
1. Railway logs show the server starting successfully
2. Health check endpoint: `https://your-app.railway.app/health`
3. API endpoints are accessible

## Notes

- The Dockerfile uses Node.js 22 (matching Railway's default)
- Prisma Client is generated during build
- TypeScript is compiled during build
- The server will start automatically (it checks for VERCEL env var, which Railway won't have)

