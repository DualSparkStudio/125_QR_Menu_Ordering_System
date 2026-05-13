# Local Testing Guide

## Why Test Locally?

Testing locally helps you catch build errors BEFORE deploying to Netlify, saving time and avoiding deployment failures.

## Setup Steps

### 1. Install Dependencies

```bash
# Install shared dependencies
cd whole/shared
npm install

# Install guest-app dependencies
cd ../guest-app
npm install

# Install netlify functions dependencies
cd ../../netlify/functions
npm install
```

### 2. Generate Prisma Clients

```bash
# Generate Prisma client for guest-app
cd whole/guest-app
npx prisma generate

# Generate Prisma client for netlify functions
cd ../../netlify/functions
npx prisma generate
```

### 3. Build the Guest App Locally

```bash
cd whole/guest-app
npm run build
```

This will run the same build process that Netlify uses and catch any TypeScript errors.

### 4. Run Type Checking Only (Faster)

If you just want to check for TypeScript errors without building:

```bash
cd whole/guest-app
npm run type-check
```

## Common Issues and Fixes

### Issue: Module not found errors
**Solution**: Make sure all dependencies are installed in the correct folders (shared, guest-app, netlify/functions)

### Issue: Prisma client errors
**Solution**: Run `npx prisma generate` in both guest-app and netlify/functions folders

### Issue: TypeScript errors
**Solution**: Run `npm run type-check` to see all TypeScript errors at once

## Quick Test Script

Create a file `test-build.sh` in the root:

```bash
#!/bin/bash
set -e

echo "Installing shared dependencies..."
cd whole/shared && npm install

echo "Installing guest-app dependencies..."
cd ../guest-app && npm install

echo "Generating Prisma clients..."
npx prisma generate

echo "Running type check..."
npm run type-check

echo "Building application..."
npm run build

echo "Installing netlify functions dependencies..."
cd ../../netlify/functions && npm install

echo "Generating Prisma client for functions..."
npx prisma generate

echo "✅ All tests passed!"
```

Make it executable:
```bash
chmod +x test-build.sh
```

Run it:
```bash
./test-build.sh
```

## Benefits of Local Testing

1. **Faster feedback** - Catch errors in seconds instead of waiting for Netlify build
2. **Save deployment quota** - Avoid wasting Netlify build minutes
3. **Better debugging** - See full error messages and stack traces
4. **Iterate quickly** - Fix and test multiple times before deploying

## Next Steps

After fixing all local build errors, commit and push to trigger a Netlify deployment.
