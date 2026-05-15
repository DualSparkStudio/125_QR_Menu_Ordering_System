# Auto-Release Tables Setup

## Overview
Tables are automatically released if orders are older than 2 hours and not paid.

## How It Works
- Orders older than 2 hours
- Status is NOT 'completed' or 'cancelled'
- Payment status is NOT 'completed'
- Table has no other active orders

When these conditions are met, the table status is set to 'available'.

## API Endpoint
```
POST /admin/restaurants/:restaurantId/tables/auto-release
Authorization: Bearer <token>
```

## Response
```json
{
  "message": "Released 3 tables",
  "releasedTables": ["T1", "T5", "T12"],
  "staleOrdersCount": 3
}
```

## Setup Options

### Option 1: Netlify Scheduled Function (Recommended for Netlify)
Create `netlify/functions/scheduled-auto-release.ts`:

```typescript
import { schedule } from '@netlify/functions';
import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Call the auto-release endpoint for each restaurant
  const restaurantIds = process.env.RESTAURANT_IDS?.split(',') || [];
  
  for (const restaurantId of restaurantIds) {
    try {
      const response = await fetch(`${process.env.API_URL}/admin/restaurants/${restaurantId}/tables/auto-release`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      });
      
      const result = await response.json();
      console.log(`Auto-release for ${restaurantId}:`, result);
    } catch (error) {
      console.error(`Failed to auto-release for ${restaurantId}:`, error);
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Auto-release completed' }),
  };
};

// Run every 30 minutes
export const scheduledHandler = schedule('*/30 * * * *', handler);
```

Add to `netlify.toml`:
```toml
[[functions]]
  name = "scheduled-auto-release"
  schedule = "*/30 * * * *"
```

### Option 2: External Cron Job
Use a service like cron-job.org or EasyCron to call the endpoint every 30 minutes:

```bash
curl -X POST https://your-api.com/admin/restaurants/RESTAURANT_ID/tables/auto-release \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 3: Admin Dashboard Button
Add a button in the admin dashboard to manually trigger the auto-release:

```typescript
const handleAutoRelease = async () => {
  try {
    const result = await adminApi.autoReleaseTables(restaurantId, token);
    alert(`Released ${result.releasedTables.length} tables`);
  } catch (error) {
    alert('Failed to auto-release tables');
  }
};
```

## Environment Variables
- `RESTAURANT_IDS`: Comma-separated list of restaurant IDs (for scheduled function)
- `API_URL`: Your API base URL
- `ADMIN_TOKEN`: Admin JWT token for authentication

## Testing
Test the endpoint manually:
```bash
curl -X POST http://localhost:3000/admin/restaurants/YOUR_RESTAURANT_ID/tables/auto-release \
  -H "Authorization: Bearer YOUR_TOKEN"
```
