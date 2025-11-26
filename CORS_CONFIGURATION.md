# CORS Configuration

## Current Setup

The API is configured with CORS to allow cross-origin requests:

```typescript
app.use(cors({
  origin: '*', // Allows all origins
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
```

## CORS Headers

The API will send these CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## For Production

If you want to restrict CORS to specific domains, update the configuration:

```typescript
app.use(cors({
  origin: [
    'https://sukiyarestaurant.vercel.app',
    'https://your-frontend-domain.com'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to send cookies
}));
```

## Testing CORS

### Test from Browser Console:
```javascript
fetch('https://sukiyaapi.vercel.app/api/menu', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Test OPTIONS (Preflight) Request:
```bash
curl -X OPTIONS https://sukiyaapi.vercel.app/api/auth/login \
  -H "Origin: https://sukiyarestaurant.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## Common CORS Issues

### Issue 1: Preflight Request Failing
**Symptom:** OPTIONS request returns 404 or error
**Solution:** Ensure CORS middleware is before route handlers

### Issue 2: Credentials Not Working
**Symptom:** Cookies/auth headers not sent
**Solution:** Set `credentials: true` and specify exact origins (not `*`)

### Issue 3: Custom Headers Blocked
**Symptom:** Custom headers not received by server
**Solution:** Add headers to `allowedHeaders` array

## Current Status

✅ CORS is properly configured
✅ All HTTP methods are allowed
✅ Content-Type and Authorization headers are allowed
✅ Preflight (OPTIONS) requests are handled automatically by cors middleware


