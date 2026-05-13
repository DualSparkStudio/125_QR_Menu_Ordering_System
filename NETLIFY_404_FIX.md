# Netlify 404 Error Fix

## Problem
All API endpoints were returning 404 errors in production, even though the build was successful.

## Root Cause Analysis

### Issue 1: Path Duplication
The Netlify configuration had incorrect path handling:
- `base = "whole/guest-app"` tells Netlify to work from that directory
- `publish = "whole/guest-app/.next"` was WRONG - this created a duplicated path
- Netlify looked for: `/opt/build/repo/whole/guest-app/whole/guest-app/.next` ❌

### Issue 2: Conflicting Configuration Files
- Had two `netlify.toml` files (root and `whole/guest-app/netlify.toml`)
- Caused confusion about which configuration to use

## Solution

### 1. Fixed Path Configuration in netlify.toml
When using `base`, all other paths must be **relative to the base directory**:

```toml
[build]
  base = "whole/guest-app"          # Work from this directory
  publish = ".next"                  # Relative to base (not whole/guest-app/.next)

[functions]
  directory = "netlify/functions"    # Relative to base (not whole/guest-app/netlify/functions)
```

### 2. Removed Duplicate Configuration
Deleted `whole/guest-app/netlify.toml` to avoid conflicts. The root `netlify.toml` now handles all configuration.

### 3. Kept _redirects File
The `whole/guest-app/public/_redirects` file is still in place as a backup.

## Files Changed
- ✏️ `netlify.toml` - Fixed publish and functions paths to be relative to base
- ❌ `whole/guest-app/netlify.toml` - Removed to avoid conflicts

## Key Learning
**When using `base` in netlify.toml:**
- ✅ `publish = ".next"` (relative to base)
- ❌ `publish = "whole/guest-app/.next"` (creates duplicate path)

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
