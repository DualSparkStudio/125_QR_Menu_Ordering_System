# Prisma Connection Pool Timeout Fix

## Problem
Getting 500 errors with message:
```
Timed out fetching a new connection from the connection pool.
(Current connection pool timeout: 10, connection limit: 1)
```

## Root Cause
In serverless environments like Netlify Functions:
1. Each function invocation may reuse Prisma Client instances
2. Connections aren't automatically closed after the function completes
3. Connection pool gets exhausted quickly with concurrent requests
4. Multiple parallel database queries in a single function can exhaust the pool

## Solution

### 1. Created withPrisma Wrapper
Created a reusable wrapper that automatically disconnects Prisma after each function execution:

**File:** `whole/guest-app/netlify/functions/lib/withPrisma.ts`

```typescript
export function withPrisma(handler: Handler): Handler {
  return async (event, context) => {
    try {
      const response = await handler(event, context);
      prisma.$disconnect().catch(console.error);
      return response;
    } catch (error) {
      prisma.$disconnect().catch(console.error);
      throw error;
    }
  };
}
```

### 2. Updated Critical Functions
Applied the wrapper to the most frequently called functions:
- ✅ `admin-dashboard.ts` - Dashboard with multiple parallel queries
- ✅ `orders-list.ts` - Order listing endpoint

**Usage pattern:**
```typescript
const handlerImpl: Handler = async (event) => {
  // ... your function logic ...
};

export const handler = withPrisma(handlerImpl);
```

### 3. Updated Prisma Client Configuration
Added proper logging configuration in `whole/guest-app/netlify/functions/lib/prisma.ts`:

```typescript
export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## Files Changed
- ✅ `whole/guest-app/netlify/functions/lib/withPrisma.ts` - New wrapper utility
- ✅ `whole/guest-app/netlify/functions/lib/prisma.ts` - Added connection config
- ✅ `whole/guest-app/netlify/functions/admin-dashboard.ts` - Applied wrapper
- ✅ `whole/guest-app/netlify/functions/orders-list.ts` - Applied wrapper

## Next Steps

### Apply to Remaining Functions (Optional)
If you still see connection pool errors, apply the `withPrisma` wrapper to other functions:

```typescript
// Before
export const handler: Handler = async (event) => { ... };

// After
import { withPrisma } from './lib/withPrisma';

const handlerImpl: Handler = async (event) => { ... };
export const handler = withPrisma(handlerImpl);
```

Functions that would benefit most:
- `tables-by-number.ts`
- `orders-create.ts`
- `menu-categories.ts`
- Any function with multiple database queries

### Monitor Performance
After deployment:
1. Check Netlify function logs for connection errors
2. Monitor response times in the browser network tab
3. Test concurrent requests (open multiple tabs)

## Why This Works

1. **Automatic Cleanup**: The wrapper ensures `prisma.$disconnect()` is called after every function execution
2. **Non-Blocking**: Disconnect happens in background (`.catch(console.error)`) so it doesn't slow down the response
3. **Error Handling**: Disconnect is called even if the function throws an error
4. **Reusable**: One wrapper can be applied to all functions

## Alternative Solutions (If Still Having Issues)

### Option 1: Increase Connection Limit in DATABASE_URL
Add connection pooling parameters to your DATABASE_URL:
```
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

### Option 2: Use Prisma Data Proxy (Recommended for Production)
- Sign up at https://cloud.prisma.io
- Create a data proxy connection
- Update DATABASE_URL to use the proxy URL
- Benefits: Better connection pooling, faster cold starts

### Option 3: Use Connection Pooler (PgBouncer)
If using your own PostgreSQL:
- Set up PgBouncer in front of your database
- Update DATABASE_URL to point to PgBouncer
- Configure pool size and connection limits

## Testing
Type checking passes:
```bash
cd whole/guest-app
npm run type-check
# ✓ No errors
```

## References
- [Prisma Connection Pool](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool)
- [Prisma in Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-netlify)
- [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy)
