# Migration Checklist
**Use this checklist to verify the refactoring is working correctly**

---

## ✅ Pre-Deployment Checklist

### 1. Code Verification
- [ ] All TypeScript files compile without errors
- [ ] No import errors in any file
- [ ] All shared utilities are accessible
- [ ] Prisma schemas are synced

### 2. Build Verification
```bash
# Backend
cd whole/backend
npm run build
# Should complete without errors

# Guest App
cd whole/guest-app
npm run build
# Should complete without errors

# Admin Dashboard
cd whole/admin-dashboard
npm run build
# Should complete without errors
```

### 3. Run Tests
```bash
# Backend tests
cd whole/backend
npm test

# If you have frontend tests
cd whole/guest-app
npm test
```

---

## 🧪 Functional Testing

### Order Management
- [ ] Create new order
  - [ ] Order number generated correctly (ORD-timestamp-random)
  - [ ] Totals calculated correctly (tax + service charge)
  - [ ] Order appears in admin panel
  - [ ] Browser notification shown (if enabled)

- [ ] Add items to existing order
  - [ ] Items added successfully
  - [ ] Totals recalculated correctly
  - [ ] "Order Updated" notification shown
  - [ ] Order card turns blue (updated)

- [ ] Update order status
  - [ ] Status changes successfully
  - [ ] Item statuses update automatically
  - [ ] Status colors display correctly
  - [ ] Status labels show correct emoji

### Order Card Colors
- [ ] New orders (<2 min) show green background
- [ ] Delayed orders (>20 min, active) show red background
- [ ] Updated orders (recent items) show blue background
- [ ] Normal orders show white background
- [ ] Inner borders match card color scheme

### Notifications
- [ ] Browser notification permission requested on first load
- [ ] New order notification shows with correct details
- [ ] Order update notification shows with item count
- [ ] Notifications vibrate on mobile (if supported)
- [ ] Notifications stay visible until clicked

### API Configuration
- [ ] API calls work in development (localhost:3001)
- [ ] API calls work in production (Netlify functions)
- [ ] WebSocket connections work (if used)

---

## 🔍 Code Quality Checks

### Imports
- [ ] No imports from deleted `whole/frontend` directory
- [ ] All shared utility imports resolve correctly
- [ ] No duplicate constant definitions
- [ ] No hardcoded API URLs

### Shared Utilities Usage
- [ ] Backend uses `generateOrderNumber()`
- [ ] Backend uses `calculateOrderTotals()`
- [ ] Netlify API uses shared utilities
- [ ] Guest-app uses shared constants
- [ ] Guest-app uses shared order utils
- [ ] Guest-app uses shared notifications
- [ ] Admin-dashboard imports from guest-app

### Prisma Schemas
- [ ] All three schemas are identical
- [ ] `npm run sync:schemas` works
- [ ] `npm run prisma:generate` works
- [ ] Prisma clients generate successfully

---

## 📊 Performance Checks

### Bundle Size
```bash
# Check build output sizes
cd whole/guest-app
npm run build
# Note the bundle sizes

cd whole/admin-dashboard
npm run build
# Note the bundle sizes
```

- [ ] Guest-app bundle is reasonable size
- [ ] Admin-dashboard bundle is reasonable size
- [ ] No duplicate dependencies in bundles

### Load Time
- [ ] Guest app loads quickly
- [ ] Admin dashboard loads quickly
- [ ] No console errors on load
- [ ] No console warnings about missing modules

---

## 🚀 Deployment Checklist

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] `DATABASE_URL` set correctly
- [ ] `JWT_SECRET` set correctly
- [ ] All required env vars present

### Netlify Deployment
- [ ] Build command correct
- [ ] Publish directory correct
- [ ] Functions directory correct
- [ ] Environment variables set
- [ ] Build succeeds on Netlify

### Backend Deployment
- [ ] Database migrations run
- [ ] Prisma client generated
- [ ] Environment variables set
- [ ] Server starts successfully

---

## 🐛 Common Issues & Solutions

### Issue: Import errors for shared utilities
**Solution**: Check relative path. From guest-app:
```typescript
import { ... } from '../../../shared/constants'; // ✅ Correct
```

### Issue: Prisma schemas out of sync
**Solution**: Run sync script:
```bash
npm run sync:schemas
npm run prisma:generate
```

### Issue: Build fails with "Cannot find module"
**Solution**: 
1. Delete node_modules and package-lock.json
2. Run `npm install`
3. Try build again

### Issue: TypeScript errors in shared files
**Solution**: Make sure TypeScript can find the files:
```json
// tsconfig.json
{
  "include": ["src", "../shared"]
}
```

---

## 📝 Post-Deployment Verification

### Production Checks
- [ ] Guest app loads in production
- [ ] Admin dashboard loads in production
- [ ] Orders can be created
- [ ] Orders can be updated
- [ ] Notifications work
- [ ] No console errors
- [ ] API calls succeed

### Monitoring
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Watch for user reports
- [ ] Verify database queries

---

## 🎯 Success Criteria

All items below should be TRUE:

- [ ] ✅ No duplicate code exists
- [ ] ✅ All apps use shared utilities
- [ ] ✅ Prisma schemas are synced
- [ ] ✅ All imports resolve correctly
- [ ] ✅ All builds succeed
- [ ] ✅ All tests pass
- [ ] ✅ Functionality works as expected
- [ ] ✅ No console errors
- [ ] ✅ Performance is good
- [ ] ✅ Documentation is complete

---

## 📞 Rollback Plan

If critical issues are found:

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push
```

### Partial Rollback
If only specific changes need reverting:
1. Identify problematic files
2. Restore from git history
3. Test thoroughly
4. Deploy fix

---

## ✅ Sign-Off

Once all checks pass:

- [ ] Developer tested locally
- [ ] QA tested on staging
- [ ] Product owner approved
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Status**: _______________

---

## 📚 Reference Documents

- [OPTIMIZATION_COMPLETE.md](./OPTIMIZATION_COMPLETE.md) - Overview
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - How to use utilities
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Detailed changes
- [CODE_ANALYSIS_REPORT.md](./CODE_ANALYSIS_REPORT.md) - Original analysis

---

**Good luck with the deployment! 🚀**
