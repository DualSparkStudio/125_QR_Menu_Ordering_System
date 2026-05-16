# Production Setup Guide

This guide explains how to configure the application for production deployment on Netlify.

## Critical Environment Variables

### 1. Database Configuration

**DATABASE_URL** (Required)
```
postgresql://user:password@host:6543/database?pgbouncer=true&connection_limit=10
```
- Use **Transaction mode** in Supabase pooler
- Set `connection_limit=10` (NOT 1) for better performance
- Get from: Supabase Dashboard > Project Settings > Database > Connection Pooling

**DIRECT_URL** (Required for migrations)
```
postgresql://user:password@host:5432/database
```
- Use **Session mode** for migrations
- Get from: Supabase Dashboard > Project Settings > Database > Direct Connection

### 2. Authentication

**JWT_SECRET** (Required)
```
your-super-secret-jwt-key-change-in-production
```
- Generate a strong random string (32+ characters)
- Use the same value across all environments

### 3. Push Notifications (Required for notifications to work)

**NEXT_PUBLIC_VAPID_PUBLIC_KEY** (Required)
```
Your VAPID public key
```

**VAPID_PRIVATE_KEY** (Required)
```
Your VAPID private key
```

**VAPID_SUBJECT** (Optional, defaults to mailto:admin@cafeqrsystem.com)
```
mailto:your-email@domain.com
```

#### How to Generate VAPID Keys

Run this command in your terminal:
```bash
npx web-push generate-vapid-keys
```

This will output:
```
=======================================
Public Key:
BKxxx...xxx

Private Key:
xxx...xxx
=======================================
```

Add these to your Netlify environment variables:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = Public Key
- `VAPID_PRIVATE_KEY` = Private Key
- `VAPID_SUBJECT` = mailto:your-email@domain.com

### 4. Netlify Configuration

**URL** (Auto-set by Netlify)
```
https://your-site.netlify.app
```
- This is automatically set by Netlify
- Used for internal API calls

## Performance Optimizations Applied

### 1. Database Connection Pooling
- Changed from `connection_limit=1` to `connection_limit=10`
- Enables parallel query execution
- Significantly improves dashboard load times

### 2. Parallel Query Execution
- Dashboard endpoint now runs all queries in parallel using `Promise.all()`
- Reduces response time from ~2-3 seconds to ~300-500ms

### 3. Prisma Client Optimization
- Configured with minimal logging in production
- Singleton pattern to reuse connections
- Proper connection URL configuration

## Notification System

### How It Works

1. **Order Created/Updated**: 
   - Database notification record created
   - Push notification sent to all admin subscriptions for that restaurant

2. **Order Status Changed**:
   - Database notification record created
   - Push notification sent to admin dashboard

3. **Admin Dashboard**:
   - Subscribes to push notifications on load
   - Receives real-time notifications even when tab is in background
   - Shows browser notifications for new orders

### Troubleshooting Notifications

If notifications aren't working in production:

1. **Check VAPID keys are set** in Netlify environment variables
2. **Check browser permissions**: Admin must allow notifications
3. **Check console logs** for push notification errors
4. **Verify subscription**: Check PushSubscription table in database

## Deployment Checklist

- [ ] Set `DATABASE_URL` with `connection_limit=10`
- [ ] Set `DIRECT_URL` for migrations
- [ ] Set `JWT_SECRET` (strong random string)
- [ ] Generate and set VAPID keys (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)
- [ ] Set `VAPID_SUBJECT` (your email)
- [ ] Deploy to Netlify
- [ ] Test order creation → notification should appear
- [ ] Test order status change → notification should appear
- [ ] Check dashboard performance (should load in <1 second)

## Common Issues

### Issue: Slow dashboard loading
**Solution**: Ensure `connection_limit=10` (not 1) in DATABASE_URL

### Issue: Notifications not working
**Solution**: 
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add to Netlify environment variables
3. Redeploy

### Issue: "connection_limit" error
**Solution**: Use Transaction mode pooler in Supabase, not Session mode

### Issue: Database connection errors
**Solution**: 
1. Check DATABASE_URL is correct
2. Verify Supabase project is active
3. Check connection pooling is enabled in Supabase

## Testing in Production

1. **Create an order** from guest app
2. **Check admin dashboard** - should see notification
3. **Change order status** - should see notification
4. **Check dashboard load time** - should be <1 second

## Monitoring

Monitor these metrics in production:
- Dashboard load time (should be <1 second)
- Order creation time (should be <2 seconds)
- Notification delivery rate (check PushSubscription table)
- Database connection pool usage (Supabase dashboard)
