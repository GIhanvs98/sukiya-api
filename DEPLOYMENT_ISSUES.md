# Deployment Issues & Solutions

## Current Issue: FUNCTION_INVOCATION_FAILED

**Error:** `FUNCTION_INVOCATION_FAILED` when accessing API endpoints on Vercel

**Root Cause:** The serverless function is failing, most likely due to:
1. Missing `DATABASE_URL` environment variable in Vercel
2. Database connection timeout in serverless environment
3. Missing environment variables

## ✅ Solution Steps

### 1. Set Environment Variables in Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

**Required Variables:**
```bash
DATABASE_URL=mongodb+srv://gihan:9Ro4sKj3idKyWB2b@sukiya.nxxs1gi.mongodb.net/sukiyarestaurant?appName=Sukiya
```

**Important:** 
- Make sure the database name `/sukiyarestaurant` is included in the URL
- Set for **Production**, **Preview**, and **Development** environments

**Optional Variables:**
```bash
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 2. Verify MongoDB Atlas Network Access

1. Go to MongoDB Atlas → **Network Access**
2. Ensure `0.0.0.0/0` is allowed (or add Vercel's IP ranges)
3. Wait 1-2 minutes for changes to propagate

### 3. Redeploy

After setting environment variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## 🔍 Verification

### Test Health Endpoint:
```bash
curl https://sukiyaapi.vercel.app/health
```

**Expected:** `{"status":"ok","message":"Backend API is running"}`

### Test API Endpoint:
```bash
curl https://sukiyaapi.vercel.app/api/menu
```

**Expected:** Array of menu items (or empty array `[]`)

## ⚠️ Common Issues

### Issue 1: "empty database name not allowed"
**Solution:** Add database name to DATABASE_URL:
```
❌ mongodb+srv://user:pass@host.net/?appName=Sukiya
✅ mongodb+srv://user:pass@host.net/sukiyarestaurant?appName=Sukiya
```

### Issue 2: Connection Timeout
**Solution:** 
- Check MongoDB Atlas network access settings
- Verify DATABASE_URL is correct
- Check Vercel function logs for detailed errors

### Issue 3: FUNCTION_INVOCATION_FAILED
**Solution:**
- Check Vercel function logs (Deployments → Function Logs)
- Verify all environment variables are set
- Ensure database is accessible from Vercel's IPs

## 📝 Frontend Error Message

The frontend error message has been updated to:
```
Cannot connect to backend server at {API_BASE_URL}. 
Please check if the API is deployed and accessible.
```

This is more appropriate for production deployments.

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **API URL:** https://sukiyaapi.vercel.app



