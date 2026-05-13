# How to Update DATABASE_URL in Netlify

## Current Issue
Your Prisma connection pool is timing out because the DATABASE_URL doesn't have connection pooling parameters.

## Quick Fix Steps

### 1. Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Select your site: **cafeqrsystem**
3. Go to **Site settings** → **Environment variables**

### 2. Find DATABASE_URL
Look for the `DATABASE_URL` variable. It probably looks like:
```
postgresql://username:password@host:5432/database_name
```

### 3. Update DATABASE_URL
Add these parameters to the end of your URL:
```
?connection_limit=10&pool_timeout=20&connect_timeout=10
```

**Full example:**
```
postgresql://username:password@host:5432/database_name?connection_limit=10&pool_timeout=20&connect_timeout=10
```

**Important:** 
- Keep your existing username, password, host, port, and database name
- Just add the `?connection_limit=10&pool_timeout=20&connect_timeout=10` at the end

### 4. Redeploy
After updating the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

OR just push a new commit to trigger automatic deployment.

## What These Parameters Do

- `connection_limit=10` - Allows up to 10 database connections per function instance (default is 1, which is too low)
- `pool_timeout=20` - Waits up to 20 seconds to get a connection from the pool (default is 10)
- `connect_timeout=10` - Timeout for establishing the initial database connection

## Alternative: Use Connection String from Your Database Provider

If you're using:
- **Supabase**: Use the "Connection pooling" URL from your project settings (it already has pooling configured)
- **Neon**: Use the pooled connection string (ends with `?sslmode=require`)
- **PlanetScale**: Connection pooling is built-in
- **Railway**: Add the parameters manually as shown above

## Verify It Works

After redeploying:
1. Open your site: https://cafeqrsystem.netlify.app
2. Go to admin dashboard
3. Check if the 500 error is gone
4. Open browser console - should see data loading without errors

## If Still Having Issues

Check Netlify function logs:
1. Go to **Functions** tab in Netlify dashboard
2. Click on `admin-dashboard` function
3. View the logs to see any remaining errors
