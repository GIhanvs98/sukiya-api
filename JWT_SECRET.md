# JWT Secret Configuration

## 🔐 Generated JWT Secret

**IMPORTANT:** Keep this secret secure and never commit it to version control!

## Generated Secret

```
27421e887ff21229eaa7183958a3a81ca0be0630fb4f3f68370dfdcc451d336db132e9833f2b951b63ee2f02c8f77e6f71df1e556b9eceddfc6688f982f37be1
```

**⚠️ IMPORTANT:** This secret is randomly generated. Copy it now and keep it secure!

## 📋 How to Use

### 1. For Local Development (.env file)

Add to `sukiya-api/.env`:
```env
JWT_SECRET=<generated-secret>
JWT_EXPIRES_IN=7d
```

### 2. For Vercel Production

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add:
   - **Key:** `JWT_SECRET`
   - **Value:** `<generated-secret>`
   - **Environment:** Select `Production`, `Preview`, and `Development`
4. Click **Save**

Also add (optional but recommended):
   - **Key:** `JWT_EXPIRES_IN`
   - **Value:** `24h` (for admin panel - shorter sessions are more secure)
   - **Environment:** Select `Production`, `Preview`, and `Development`

### 3. Redeploy

After setting environment variables:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
   - Add `.env` to `.gitignore`
   - Never commit `.env` files

2. **Use different secrets for different environments**
   - Development: Can use a simple secret for testing
   - Production: Must use a strong, randomly generated secret

3. **Rotate secrets periodically**
   - Change JWT_SECRET every 6-12 months
   - When rotating, users will need to log in again

4. **Keep secrets secure**
   - Don't share in chat/email
   - Use environment variables, not hardcoded values
   - Use secret management tools for production

## 🧪 Verify Secret is Set

After setting the secret, verify it's working:

```bash
# Test login (should work with new secret)
curl -X POST https://sukiyaapi.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"admin123"}'
```

## 📝 Notes

- The secret should be at least 32 characters long (64+ recommended)
- Using hex encoding gives you 128 characters (64 bytes × 2)
- This provides 256 bits of entropy (very secure)

## ⚠️ If You Lose the Secret

If you lose the JWT_SECRET:
1. Generate a new one
2. Set it in Vercel
3. All existing tokens will become invalid
4. Users will need to log in again (this is expected)

