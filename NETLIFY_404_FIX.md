# Netlify 404 Error Fix

## Problem
All API endpoints were returning 404 errors in production, even though the build was successful.

## Root Cause
The Netlify configuration had conflicting settings between the root `netlify.toml` and `whole/guest-app/netlify.toml`:

1. **Root netlify.toml** had:
   - `base = "whole/guest-app"`
   - `functions.directory = "netlify/functions"` (relative to base)
   - This would look for functions at: `whole/guest-app/netlify/functions` ✓

2. **whole/guest-app/netlify.toml** had:
   - `functions.directory = "./netlify/functions"` (relative to guest-app)
   - This would also look at: `whole/guest-app/netlify/functions` ✓

However, the `publish` directory was inconsistent:
- Root: `publish = ".next"` (relative to base = `whole/guest-app/.next`) ✓
- But having two config files caused Netlify to be confused about which configuration to use

## Solution

### 1. Fixed Root netlify.toml
Updated the functions directory path to be explicit:
```toml
[build]
  base = "whole/guest-app"
  publish = "whole/guest-app/.next"

[functions]
  directory = "whole/guest-app/netlify/functions"
```

### 2. Removed Duplicate Configuration
Deleted `whole/guest-app/netlify.toml` to avoid conflicts. The root `netlify.toml` now handles all configuration.

### 3. Kept _redirects File
The `whole/guest-app/public/_redirects` file is still in place as a backup, but the redirects in `netlify.toml` should now work correctly.

## Files Changed
- ✏️ `netlify.toml` - Fixed functions directory path and publish path
- ❌ `whole/guest-app/netlify.toml` - Removed to avoid conflicts

## Next Steps
1. Commit these changes
2. Push to trigger a new Netlify deployment
3. Test the API endpoints:
   - `/api/tables/number/2`
   - `/api/admin/restaurants/rest1/dashboard`
   - `/api/restaurants/rest1/orders`

## Verification
Type checking passes with no errors:
```bash
cd whole/guest-app
npm run type-check
# ✓ No errors
```
