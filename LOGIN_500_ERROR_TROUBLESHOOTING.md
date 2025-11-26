# Login 500 Error - Troubleshooting Guide

## 🔴 Issue
Login endpoint returns 500 error: "Failed to authenticate"

## 🔍 Root Cause Analysis

The 500 error is likely caused by one of these issues:

### 1. Database Connection Failure (Most Likely)
- `getMongoDb()` is failing to connect
- DATABASE_URL environment variable not set in Vercel
- MongoDB Atlas network access not configured
- Connection timeout on cold start

### 2. Missing Environment Variables
- `DATABASE_URL` not set
- `JWT_SECRET` not set (has default, but should be set)

### 3. Error Handling Issue
- Errors not being properly caught and formatted
- Response not being sent correctly through serverless-http

## ✅ Fixes Applied

1. **Improved Error Handling**
   - Added `next` parameter to async route handlers
   - Errors now pass to Express error handler using `next(error)`
   - Added specific database connection error handling

2. **Better Error Messages**
   - Database connection errors return 503 (Service Unavailable)
   - More detailed error logging
   - Better error response formatting

## 🔧 Diagnostic Steps

### Step 1: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Go to **Functions** tab
4. Click on the function that failed
5. Check **Logs** for error messages

**Look for:**
- `Database connection error during login`
- `MongoDB connection failed`
- `DATABASE_URL is not set`
- Any stack traces

### Step 2: Verify Environment Variables

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - `DATABASE_URL` - MongoDB connection string
   - `JWT_SECRET` - (optional, has default)

**DATABASE_URL Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?appName=AppName
```

**Important:**
- Must include database name (`/database-name`)
- Must be set for **Production**, **Preview**, and **Development**

### Step 3: Check MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Ensure `0.0.0.0/0` is allowed (or add Vercel IP ranges)
4. Wait 1-2 minutes for changes to propagate

### Step 4: Test Database Connection

**Test locally:**
```bash
cd sukiya-api
npm run test:db
```

**Test via API:**
```bash
# Test health endpoint (no DB)
curl https://sukiyaapi.vercel.app/health

# Test login endpoint
curl -X POST https://sukiyaapi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"admin123"}'
```

## 🐛 Common Issues & Solutions

### Issue 1: "DATABASE_URL is not set"

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `DATABASE_URL` with your MongoDB connection string
3. Redeploy the function

### Issue 2: "MongoDB connection failed"

**Possible Causes:**
- Network access not configured
- Wrong credentials
- Database name missing from URL
- Connection timeout

**Solutions:**
1. Check MongoDB Atlas Network Access (allow `0.0.0.0/0`)
2. Verify DATABASE_URL includes database name
3. Check MongoDB credentials
4. Increase connection timeout in `database.ts` if needed

### Issue 3: "Function timeout"

**Solution:**
- Database connection is taking too long on cold start
- Consider using connection pooling
- Or upgrade Vercel plan (Pro has 60s timeout vs 10s for Hobby)

### Issue 4: "Invalid credentials" (401) vs "Failed to authenticate" (500)

- **401** = User not found or wrong password (expected)
- **500** = Server error (database connection, etc.)

## 📋 Verification Checklist

- [ ] DATABASE_URL is set in Vercel environment variables
- [ ] DATABASE_URL includes database name (`/sukiyarestaurant`)
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] JWT_SECRET is set (optional but recommended)
- [ ] Latest code is deployed
- [ ] Vercel logs show no connection errors
- [ ] Health endpoint works (`/health`)
- [ ] Login endpoint returns proper error (not 500)

## 🔄 Next Steps After Fix

1. **Redeploy** after setting environment variables
2. **Test login** endpoint
3. **Check Vercel logs** for any remaining errors
4. **Monitor** for recurring issues

## 📝 Error Response Format

**Before Fix (500):**
```json
{
  "error": "Failed to authenticate"
}
```

**After Fix (503 - Database Error):**
```json
{
  "error": "Database connection failed",
  "details": "MongoDB connection failed: ..." // in development
}
```

**After Fix (401 - Invalid Credentials):**
```json
{
  "error": "Invalid credentials"
}
```

## 🔗 Related Files

- `src/routes/auth.ts` - Login route implementation
- `src/config/database.ts` - Database connection logic
- `src/server.ts` - Express error handler
- `api/index.ts` - Vercel serverless handler

## 💡 Tips

1. **Always check Vercel logs first** - They show the actual error
2. **Test health endpoint** - If this fails, it's not a DB issue
3. **Use development mode** - Shows more error details
4. **Check network access** - Most common issue with MongoDB Atlas


