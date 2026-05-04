# Netlify Deployment Guide

## ✅ What's Been Done

1. **Fixed all build errors**
   - TypeScript compilation errors resolved
   - React infinite loop fixed
   - API method naming corrected

2. **Created Netlify Functions**
   - Serverless API at `/netlify/functions/api.ts`
   - All backend routes implemented
   - Prisma client configured for PostgreSQL

3. **Database Setup**
   - Supabase PostgreSQL database connected
   - Schema pushed successfully
   - Tables created

## 🚀 Deployment Steps

### 1. Set Environment Variables in Netlify

Go to your Netlify dashboard → Site settings → Environment variables

Add these variables:

```bash
# Database (Pooled connection for serverless)
DATABASE_URL=postgresql://postgres.chnzfuzczkoaginjfwzi:cafeqrsyste@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Database (Direct connection for migrations)
DIRECT_URL=postgresql://postgres.chnzfuzczkoaginjfwzi:cafeqrsyste@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026

# Admin Dashboard API URL (will be your Netlify URL)
NEXT_PUBLIC_API_URL=https://cafeqrsystem.netlify.app/api
```

### 2. Deploy to Netlify

```bash
# Commit your changes
git add .
git commit -m "Add Netlify Functions and fix build errors"
git push origin main
```

Netlify will automatically:
- Build the admin dashboard
- Deploy the serverless functions
- Set up the `/api/*` redirect

### 3. Test the Deployment

Once deployed, test the login:

1. Go to `https://cafeqrsystem.netlify.app`
2. Try logging in with demo credentials (if you have seeded data)
3. Check browser console for any errors

## 📁 Project Structure

```
.
├── admin-dashboard/          # Next.js admin dashboard
│   ├── src/
│   │   ├── app/             # Pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API client
│   │   └── store/           # Zustand stores
│   └── package.json
│
├── netlify/
│   └── functions/
│       ├── api.ts           # Main serverless function
│       ├── prisma/          # Database schema
│       ├── package.json     # Function dependencies
│       └── .env             # Local env (not committed)
│
└── netlify.toml             # Netlify configuration
```

## 🔧 How It Works

### Request Flow

```
User Browser
    ↓
https://cafeqrsystem.netlify.app/api/auth/staff/login
    ↓
Netlify Redirect (netlify.toml)
    ↓
/.netlify/functions/api/auth/staff/login
    ↓
Serverless Function (api.ts)
    ↓
Prisma Client → Supabase PostgreSQL
    ↓
Response back to browser
```

### API Routes Available

All routes from the original NestJS backend are available:

- `POST /api/auth/staff/login` - Staff login
- `POST /api/auth/table/session` - Create table session
- `POST /api/auth/refresh` - Refresh token
- `GET /api/restaurants/:id` - Get restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `GET /api/admin/restaurants/:id/dashboard` - Dashboard stats
- `GET /api/restaurants/:id/tables` - Get tables
- `POST /api/restaurants/:id/tables` - Create table
- `PUT /api/restaurants/:id/tables/:id` - Update table
- `DELETE /api/restaurants/:id/tables/:id` - Delete table
- `GET /api/restaurants/:id/menu/categories/admin` - Get categories
- `POST /api/restaurants/:id/menu/categories` - Create category
- `POST /api/restaurants/:id/menu/items` - Create menu item
- `PUT /api/restaurants/:id/menu/items/:id` - Update menu item
- `DELETE /api/restaurants/:id/menu/items/:id` - Delete menu item
- `GET /api/restaurants/:id/orders` - Get orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/admin/restaurants/:id/staff` - Get staff
- `POST /api/admin/restaurants/:id/staff` - Create staff
- `PUT /api/admin/restaurants/:id/staff/:id` - Update staff
- `DELETE /api/admin/restaurants/:id/staff/:id` - Delete staff
- `GET /api/restaurants/:id/coupons` - Get coupons
- `POST /api/restaurants/:id/coupons` - Create coupon
- `GET /api/restaurants/:id/reviews` - Get reviews
- `GET /api/restaurants/:id/reports/sales` - Sales report

## 🔐 Security Notes

1. **JWT_SECRET**: Change this to a strong random string in production
2. **Database Password**: The password is visible in the connection string - rotate it if needed
3. **CORS**: Currently set to allow all origins (`*`) - restrict this in production

## 🐛 Troubleshooting

### Function Timeout
If functions timeout (10 seconds default):
- Check database connection pooling
- Optimize Prisma queries
- Consider upgrading Netlify plan for longer timeouts

### Cold Starts
First request after inactivity may be slow:
- This is normal for serverless
- Consider using Netlify's "Keep Functions Warm" feature

### Database Connection Issues
If you see "Too many connections":
- Use the pooled connection string (port 6543)
- Set `connection_limit=1` in the connection string
- Check Supabase connection limits

### Build Failures
If build fails:
- Check environment variables are set
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check build logs in Netlify dashboard

## 📊 Monitoring

Monitor your deployment:
- **Netlify Dashboard**: Build logs, function logs
- **Supabase Dashboard**: Database queries, connection pool
- **Browser Console**: Frontend errors

## 🎯 Next Steps

1. **Seed the database** with initial data (restaurant, staff, menu items)
2. **Test all features** in the admin dashboard
3. **Set up custom domain** (optional)
4. **Configure CORS** for production
5. **Set up monitoring** and error tracking
6. **Deploy guest app** and backend separately if needed

## 📝 Notes

- **WebSockets**: Not supported in Netlify Functions (real-time features won't work)
- **File Uploads**: Need to use external storage (S3, Cloudinary, etc.)
- **Background Jobs**: Not supported (use external services like Inngest, Trigger.dev)
- **Redis**: Not available (use external Redis service if needed)

## ✅ Deployment Checklist

- [ ] Environment variables set in Netlify
- [ ] Database schema pushed to Supabase
- [ ] Code committed and pushed to Git
- [ ] Netlify build successful
- [ ] Functions deployed
- [ ] Login works
- [ ] API endpoints responding
- [ ] Dashboard loads correctly

---

**Your admin dashboard is ready to deploy!** 🚀

Just set the environment variables in Netlify and push your code.
