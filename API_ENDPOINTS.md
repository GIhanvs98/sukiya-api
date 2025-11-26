# Sukiya Restaurant API Endpoints

**Deployed URL:** https://sukiyaapifinal.vercel.app

## 📋 Available Endpoints

### Health Check
- **GET** `/health` - Server health check

### Menu Endpoints
- **GET** `/api/menu` - Get all menu items (public: active only, admin: all items with Bearer token)
- **POST** `/api/menu` - Create a new menu item
- **PATCH** `/api/menu/:id` - Update a menu item
- **DELETE** `/api/menu/:id` - Delete a menu item

### Orders Endpoints
- **GET** `/api/orders` - Get all orders
- **PATCH** `/api/orders/:id/status` - Update order status (Received, Preparing, Ready, Completed)

### Users Endpoints
- **GET** `/api/users` - Get all users
- **POST** `/api/users` - Create a new user
- **PATCH** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Authentication Endpoints
- **POST** `/api/auth/login` - Admin/Manager/Staff login
  ```json
  {
    "userId": "admin",
    "password": "admin123"
  }
  ```
- **POST** `/api/auth/verify` - Verify JWT token (requires Bearer token in Authorization header)
- **POST** `/api/auth/set-password` - Set password for admin/manager/staff user

## 🔐 Test Credentials

- **Admin:** `admin` / `admin123` or `admin001` / `admin123`
- **Manager:** `manager` / `manager123` or `manager001` / `manager123`
- **Staff:** `staff` / `staff123` (Note: Staff cannot login to admin panel)

## ⚠️ Current Status

**All endpoints are returning 500 Internal Server Error**

### Likely Causes:
1. **Missing Environment Variables in Vercel:**
   - `DATABASE_URL` - MongoDB connection string (must include database name: `/sukiyarestaurant`)
   - `JWT_SECRET` - Secret key for JWT tokens (optional, has default)
   - `JWT_EXPIRES_IN` - JWT expiration time (optional, defaults to '7d')
   - `LINE_CHANNEL_ACCESS_TOKEN` - LINE bot access token (optional)
   - `LINE_CHANNEL_SECRET` - LINE bot secret (optional)

2. **Database Connection Issues:**
   - DATABASE_URL might not include the database name
   - MongoDB Atlas might have IP restrictions
   - Connection timeout in serverless environment

### 🔧 Fix Steps:

1. **Check Vercel Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure `DATABASE_URL` is set with format: `mongodb+srv://user:pass@host.net/sukiyarestaurant?appName=Sukiya`

2. **Verify Database Connection:**
   - Run `npm run test:db` locally to verify DATABASE_URL works
   - Check MongoDB Atlas network access settings

3. **Redeploy:**
   - After setting environment variables, redeploy the application

## 📊 Testing

Run endpoint tests:
```bash
npm run test:api
```

Test database connection:
```bash
npm run test:db
```

## 📝 Example Requests

### Login
```bash
curl -X POST https://sukiyaapifinal.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"admin123"}'
```

### Get Menu Items
```bash
curl https://sukiyaapifinal.vercel.app/api/menu
```

### Get Menu Items (Admin - all items)
```bash
curl https://sukiyaapifinal.vercel.app/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Orders
```bash
curl https://sukiyaapifinal.vercel.app/api/orders
```

### Update Order Status
```bash
curl -X PATCH https://sukiyaapifinal.vercel.app/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Preparing"}'
```

