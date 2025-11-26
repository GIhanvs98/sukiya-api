# Vercel Deployment Guide

## 🚀 Quick Setup

### 1. Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables** and add:

#### Required Variables:

```bash
DATABASE_URL=mongodb+srv://gihan:9Ro4sKj3idKyWB2b@sukiya.nxxs1gi.mongodb.net/sukiyarestaurant?appName=Sukiya
```

**Important:** Make sure the DATABASE_URL includes `/sukiyarestaurant` before the `?`

#### Optional Variables:

```bash
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
LINE_CHANNEL_ACCESS_TOKEN=your-line-token
LINE_CHANNEL_SECRET=your-line-secret
NODE_ENV=production
```

### 2. Environment Variable Settings

For each variable:
- **Environment:** Select `Production`, `Preview`, and `Development` (or just `Production` if you only want it in production)
- Click **Save**

### 3. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## 📋 Verification Checklist

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `DATABASE_URL` includes database name (`/sukiyarestaurant`)
- [ ] Environment variables are set for `Production` environment
- [ ] Application has been redeployed after setting variables
- [ ] Health check endpoint returns 200: `https://sukiyaapi.vercel.app/health`

## 🔍 Testing Deployment

### Test Health Endpoint:
```bash
curl https://sukiyaapi.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend API is running"
}
```

### Test Database Connection:
```bash
curl https://sukiyaapi.vercel.app/api/menu
```

Should return menu items array (empty array `[]` if no items, or items if seeded).

### Test Authentication:
```bash
curl -X POST https://sukiyaapi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"admin123"}'
```

## 🐛 Troubleshooting

### 500 Internal Server Error

**Cause:** Missing or incorrect `DATABASE_URL`

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel
2. Check that database name is included: `...mongodb.net/sukiyarestaurant?...`
3. Verify MongoDB Atlas allows connections from Vercel IPs (Network Access → Add IP `0.0.0.0/0` for all)

### Database Connection Timeout

**Cause:** MongoDB Atlas network restrictions

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs) OR add Vercel's IP ranges
3. Wait 1-2 minutes for changes to propagate
4. Redeploy on Vercel

### Empty Database

**Solution:** Run seeders locally or create a seeding script for Vercel:
```bash
npm run seed:users
npm run seed:orders
npm run seed:passwords
```

## 📁 Project Structure for Vercel

```
sukiya-api/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── server.ts         # Express app
│   ├── routes/           # API routes
│   └── config/           # Configuration
├── vercel.json           # Vercel configuration
└── package.json
```

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Deployed API:** https://sukiyaapi.vercel.app
- **API Documentation:** See `API_ENDPOINTS.md`

## 📝 Notes

- Vercel uses serverless functions, so database connections are created per request
- Connection pooling is handled automatically
- Cold starts may cause first request to be slower (~5-6 seconds)
- Subsequent requests should be faster

