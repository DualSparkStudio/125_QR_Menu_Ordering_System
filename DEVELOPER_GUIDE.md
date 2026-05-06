# Developer Guide - Shared Utilities
**Quick Reference for Using Shared Code**

---

## 📁 Project Structure

```
whole/
├── backend/              # NestJS API
├── admin-dashboard/      # Admin UI (Next.js)
├── guest-app/            # Guest + Admin pages (Next.js)
└── shared/               # 🎯 SHARED UTILITIES (USE THESE!)
    ├── constants.ts      # Status constants, colors, labels
    ├── orderUtils.ts     # Order calculations & helpers
    ├── config.ts         # API URL configuration
    ├── notificationUtils.ts # Browser notifications
    ├── cache.ts          # Simple caching
    ├── adminApi.ts       # API client
    ├── adminStore.ts     # State management
    └── authStore.ts      # Auth logic
```

---

## 🚀 Quick Start

### Import Shared Utilities

```typescript
// In any frontend file
import {
  ORDER_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../../../shared/constants';

import {
  getOrderAge,
  isDelayedOrder,
  calculateOrderTotals,
} from '../../../shared/orderUtils';

import { getApiUrl } from '../../../shared/config';

import {
  notifyNewOrder,
  initializeNotifications,
} from '../../../shared/notificationUtils';
```

```typescript
// In backend files
import {
  generateOrderNumber,
  calculateOrderTotals,
} from '../../../../shared/orderUtils';
```

---

## 📚 Common Use Cases

### 1. Display Order Status

```typescript
import { STATUS_LABELS, STATUS_COLORS } from '../../../shared/constants';

function OrderBadge({ status }: { status: string }) {
  return (
    <span className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </span>
  );
}
```

### 2. Check Order Age

```typescript
import { getOrderAge, isDelayedOrder, isNewOrder } from '../../../shared/orderUtils';

const age = getOrderAge(order.createdAt); // Returns minutes
const isDelayed = isDelayedOrder(order.createdAt, order.status); // Returns boolean
const isNew = isNewOrder(order.createdAt); // Returns boolean

if (isDelayed) {
  console.log(`Order is ${age} minutes old - DELAYED!`);
}
```

### 3. Calculate Order Totals

```typescript
import { calculateOrderTotals } from '../../../shared/orderUtils';

const { taxAmount, serviceCharge, totalAmount } = calculateOrderTotals(
  subtotal,
  restaurant.taxPercentage,
  restaurant.serviceChargePercentage,
  discountAmount
);
```

### 4. Generate Order Number

```typescript
import { generateOrderNumber } from '../../../shared/orderUtils';

const orderNumber = generateOrderNumber();
// Returns: "ORD-1715012345678-A1B2C3"
```

### 5. Show Browser Notification

```typescript
import { notifyNewOrder, initializeNotifications } from '../../../shared/notificationUtils';

// Initialize on app load
useEffect(() => {
  initializeNotifications();
}, []);

// Show notification
notifyNewOrder(orderNumber, tableNumber);
```

### 6. Get API URL

```typescript
import { getApiUrl } from '../../../shared/config';

const apiUrl = getApiUrl();
// Server-side: http://localhost:3001
// Client-side: /api (or NEXT_PUBLIC_API_URL)
```

### 7. Use Cache

```typescript
import { menuCache } from '../../../shared/cache';

// Set cache (60 seconds TTL)
menuCache.set('menu-123', menuData, 60000);

// Get from cache
const cached = menuCache.get('menu-123');
if (cached) {
  return cached; // Use cached data
}

// Fetch fresh data if not cached
const fresh = await fetchMenu();
menuCache.set('menu-123', fresh, 60000);
```

### 8. Map Order Status to Item Status

```typescript
import { getItemStatusFromOrderStatus } from '../../../shared/orderUtils';

const itemStatus = getItemStatusFromOrderStatus('preparing');
// Returns: 'preparing'

const itemStatus2 = getItemStatusFromOrderStatus('confirmed');
// Returns: 'pending'
```

### 9. Get Order Card Color

```typescript
import { getOrderCardColor } from '../../../shared/orderUtils';

const bgColor = getOrderCardColor(order);
// Returns: '#fecaca' (red) for delayed
// Returns: '#bbf7d0' (green) for new
// Returns: '#bfdbfe' (blue) for updated
// Returns: 'transparent' for normal
```

### 10. Create Status Dropdown

```typescript
import { STATUS_OPTIONS } from '../../../shared/constants';

<select value={status} onChange={handleChange}>
  {STATUS_OPTIONS.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
```

---

## 🎨 Available Constants

### Order Statuses
```typescript
ORDER_STATUSES.PENDING      // 'pending'
ORDER_STATUSES.CONFIRMED    // 'confirmed'
ORDER_STATUSES.PREPARING    // 'preparing'
ORDER_STATUSES.READY        // 'ready'
ORDER_STATUSES.SERVED       // 'served'
ORDER_STATUSES.COMPLETED    // 'completed'
ORDER_STATUSES.CANCELLED    // 'cancelled'
```

### Status Colors (Tailwind classes)
```typescript
STATUS_COLORS.pending       // 'text-yellow-600'
STATUS_COLORS.confirmed     // 'text-blue-600'
STATUS_COLORS.preparing     // 'text-orange-600'
STATUS_COLORS.ready         // 'text-green-600'
STATUS_COLORS.served        // 'text-purple-600'
STATUS_COLORS.completed     // 'text-gray-500'
STATUS_COLORS.cancelled     // 'text-red-500'
```

### Status Labels (with emojis)
```typescript
STATUS_LABELS.pending       // '🕐 Pending'
STATUS_LABELS.confirmed     // '✓ Confirmed'
STATUS_LABELS.preparing     // '👨‍🍳 Cooking'
STATUS_LABELS.ready         // '🔔 Ready'
STATUS_LABELS.served        // '🍽️ Served'
STATUS_LABELS.completed     // '✅ Completed'
STATUS_LABELS.cancelled     // '✕ Cancelled'
```

### Time Constants
```typescript
TIME_CONSTANTS.NEW_ORDER_THRESHOLD      // 2 minutes
TIME_CONSTANTS.DELAYED_ORDER_THRESHOLD  // 20 minutes
TIME_CONSTANTS.RECENT_ITEM_THRESHOLD    // 2 minutes
TIME_CONSTANTS.POLLING_INTERVAL         // 20000 ms (20 seconds)
```

### Card Colors
```typescript
ORDER_CARD_COLORS.DELAYED   // '#fecaca' (red-200)
ORDER_CARD_COLORS.NEW       // '#bbf7d0' (green-200)
ORDER_CARD_COLORS.UPDATED   // '#bfdbfe' (blue-200)
ORDER_CARD_COLORS.DEFAULT   // 'transparent'
```

---

## 🔧 Utility Functions Reference

### Order Age & Status
- `getOrderAge(createdAt)` → number (minutes)
- `isDelayedOrder(createdAt, status)` → boolean
- `isNewOrder(createdAt)` → boolean
- `hasRecentItems(order)` → boolean
- `isActiveOrder(status)` → boolean

### Order Calculations
- `calculateOrderTotals(subtotal, tax%, service%, discount)` → { taxAmount, serviceCharge, totalAmount }
- `generateOrderNumber()` → string
- `calculateDiscount(subtotal, coupon)` → { discountAmount, finalAmount }
- `calculateEstimatedTime(items, pendingCount)` → number (minutes)

### Display & Formatting
- `getOrderCardColor(order)` → string (hex color)
- `formatCurrency(amount, currency)` → string
- `getItemStatusFromOrderStatus(orderStatus)` → string

### Sorting & Filtering
- `sortOrdersByPriority(orders)` → sorted array
- `getActiveOrdersCount(orders)` → number

### Notifications
- `initializeNotifications()` → void
- `requestNotificationPermission()` → Promise<NotificationPermission>
- `canShowNotifications()` → boolean
- `showNotification(options)` → Notification | null
- `notifyNewOrder(orderNumber, tableNumber)` → void
- `notifyOrderUpdate(orderNumber, tableNumber, itemCount)` → void
- `notifyOrderStatus(orderNumber, status)` → void

### Configuration
- `getApiUrl()` → string
- `getWebSocketUrl()` → string
- `isProduction()` → boolean
- `isDevelopment()` → boolean
- `getDatabaseUrl()` → string

### Caching
- `cache.get(key)` → T | null
- `cache.set(key, data, ttlMs)` → void
- `cache.has(key)` → boolean
- `cache.delete(key)` → boolean
- `cache.clear()` → void

---

## ⚠️ Important Rules

### ❌ DON'T
- Don't duplicate logic that exists in shared utilities
- Don't hardcode status values, colors, or labels
- Don't hardcode API URLs
- Don't copy-paste order calculation logic
- Don't create duplicate notification functions

### ✅ DO
- Always import from shared utilities
- Use constants for all status-related values
- Use shared functions for calculations
- Use shared config for API URLs
- Extend shared utilities when adding new features

---

## 🔄 Prisma Schema Management

### Syncing Schemas

The source of truth is: `whole/backend/prisma/schema.prisma`

**After editing the schema**:
```bash
# Sync to all projects
npm run sync:schemas

# Generate Prisma clients
npm run prisma:generate
```

**Manual sync** (if needed):
```bash
node scripts/sync-prisma-schemas.js
```

---

## 🧪 Testing

### Test Shared Utilities

```typescript
import { getOrderAge, isDelayedOrder } from '../../../shared/orderUtils';

describe('Order Utils', () => {
  it('should calculate order age correctly', () => {
    const createdAt = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    expect(getOrderAge(createdAt)).toBe(10);
  });

  it('should detect delayed orders', () => {
    const createdAt = new Date(Date.now() - 25 * 60 * 1000); // 25 minutes ago
    expect(isDelayedOrder(createdAt, 'preparing')).toBe(true);
  });
});
```

---

## 📝 Adding New Features

### Adding a New Status

1. **Update constants.ts**:
```typescript
export const ORDER_STATUSES = {
  // ... existing
  NEW_STATUS: 'new_status',
};

export const STATUS_COLORS = {
  // ... existing
  new_status: 'text-purple-600',
};

export const STATUS_LABELS = {
  // ... existing
  new_status: '🎉 New Status',
};
```

2. **Update backend** (if needed):
```typescript
// Backend automatically uses new constants
```

3. **Frontend automatically picks up changes** ✅

### Adding a New Utility Function

1. **Add to appropriate shared file**:
```typescript
// whole/shared/orderUtils.ts
export function myNewFunction(param: string): string {
  // Implementation
  return result;
}
```

2. **Import and use**:
```typescript
import { myNewFunction } from '../../../shared/orderUtils';

const result = myNewFunction('test');
```

---

## 🐛 Troubleshooting

### Import Errors

**Problem**: `Cannot find module '../../../shared/constants'`

**Solution**: Check the relative path. From guest-app:
```typescript
import { ... } from '../../../shared/constants'; // ✅ Correct
import { ... } from '../../shared/constants';    // ❌ Wrong
```

### Type Errors

**Problem**: `Property 'STATUS_COLORS' does not exist`

**Solution**: Make sure you're importing from the correct file:
```typescript
import { STATUS_COLORS } from '../../../shared/constants'; // ✅
```

### Prisma Schema Out of Sync

**Problem**: Different schemas in different projects

**Solution**: Run sync script:
```bash
npm run sync:schemas
npm run prisma:generate
```

---

## 📞 Need Help?

1. Check this guide first
2. Look at existing code examples in guest-app
3. Check the REFACTORING_SUMMARY.md for details
4. Ask the team

---

**Remember**: Always use shared utilities instead of duplicating code! 🎯
