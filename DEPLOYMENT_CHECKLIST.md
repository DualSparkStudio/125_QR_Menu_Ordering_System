# Deployment Checklist - Production Fixes

Use this checklist to deploy the performance and notification fixes.

---

## Pre-Deployment

- [ ] Read `README_FIXES.md` for overview
- [ ] Read `QUICK_FIX_GUIDE.md` for steps
- [ ] Have Netlify dashboard access ready
- [ ] Have terminal/command line ready

---

## Step 1: Update Database Connection

- [ ] Open Netlify Dashboard
- [ ] Go to: Site Settings → Environment Variables
- [ ] Find: `DATABASE_URL`
- [ ] Change: `connection_limit=1` to `connection_limit=10`
- [ ] Save changes

**Why**: Enables parallel queries for 3x performance boost

---

## Step 2: Generate VAPID Keys

- [ ] Open terminal in project root
- [ ] Run: `npm install` (if not done already)
- [ ] Run: `npm run generate:vapid`
- [ ] Copy the three values shown

**Why**: Required for push notifications to work

---

## Step 3: Add VAPID Keys to Netlify

- [ ] Open Netlify Dashboard
- [ ] Go to: Site Settings → Environment Variables
- [ ] Click: "Add a variable"
- [ ] Add: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = (public key from step 2)
- [ ] Add: `VAPID_PRIVATE_KEY` = (private key from step 2)
- [ ] Add: `VAPID_SUBJECT` = `mailto:your-email@domain.com`
- [ ] Save all changes

**Why**: Enables push notifications in production

---

## Step 4: Deploy Code Changes

- [ ] Run: `git status` (verify changes)
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "fix: performance and notification issues"`
- [ ] Run: `git push`
- [ ] Wait for Netlify auto-deploy (2-3 minutes)

**Why**: Deploys the optimized code

---

## Step 5: Verify Performance

- [ ] Open admin dashboard in browser
- [ ] Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Reload dashboard
- [ ] Check: Dashboard loads in <1 second
- [ ] Check: No console errors
- [ ] Check: Orders page loads fast

**Expected**: Everything should be 3x faster

---

## Step 6: Verify Notifications

- [ ] Open admin dashboard
- [ ] Allow notifications when browser prompts
- [ ] Open guest app in another tab/device
- [ ] Create a test order
- [ ] Check: Notification appears in admin dashboard
- [ ] Change order status
- [ ] Check: Notification appears for status change

**Expected**: Real-time notifications working

---

## Step 7: Monitor

- [ ] Check Netlify function logs for errors
- [ ] Check browser console for errors
- [ ] Monitor dashboard performance
- [ ] Monitor notification delivery

**Expected**: No errors, fast performance

---

## Troubleshooting

### Dashboard still slow?
- [ ] Verify `DATABASE_URL` has `connection_limit=10`
- [ ] Check Netlify function logs
- [ ] Check Supabase database status

### Notifications not working?
- [ ] Verify all 3 VAPID variables are set
- [ ] Check browser allowed notifications
- [ ] Check browser console for errors
- [ ] Check Netlify function logs

### Other issues?
- [ ] See `PRODUCTION_SETUP.md` → Troubleshooting
- [ ] Check Netlify function logs
- [ ] Verify all environment variables

---

## Rollback Plan (If Needed)

If issues occur:

- [ ] Revert `connection_limit` to 1 in Netlify
- [ ] Remove VAPID keys from Netlify
- [ ] Redeploy previous version
- [ ] Check logs for specific errors

---

## Success Criteria

✅ All checks passed when:
- [ ] Dashboard loads in <1 second
- [ ] Orders create in <500ms
- [ ] Notifications appear for new orders
- [ ] Notifications appear for status changes
- [ ] No errors in console
- [ ] No errors in Netlify logs

---

## Post-Deployment

- [ ] Monitor performance for 24 hours
- [ ] Check notification delivery rate
- [ ] Verify no database connection errors
- [ ] Document any issues found

---

## Time Estimate

- Pre-deployment: 2 minutes
- Steps 1-4: 5 minutes
- Steps 5-6: 3 minutes
- Step 7: Ongoing

**Total**: ~10 minutes + monitoring

---

## Support

If you need help:
1. Check `PRODUCTION_SETUP.md` for detailed troubleshooting
2. Check Netlify function logs
3. Check browser console
4. Review `FIXES_APPLIED.md` for technical details

---

## Notes

- Keep VAPID private key secret
- Don't commit VAPID keys to git
- Monitor performance after deployment
- Test notifications thoroughly

---

**Status**: Ready to deploy ✅
**Difficulty**: Easy
**Impact**: High (3x performance + notifications)
