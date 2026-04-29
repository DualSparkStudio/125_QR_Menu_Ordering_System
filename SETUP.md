# Restaurant Ordering System - Setup Guide

## System Architecture

All apps now run on **port 3000**:
- **Guest App**: `http://localhost:3000` (customer ordering interface)
- **Admin Dashboard**: `http://localhost:3000/admin` (restaurant management)
- **Backend API**: Runs separately on port 3000 (NestJS)

## Quick Start

### 1. Install Dependencies
```bash
npm install
npm run install:all
```

### 2. Setup Backend Database
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### 3. Run Everything
```bash
npm run dev
```

This starts:
- ✅ Backend API (port 3000)
- ✅ Guest + Admin App (port 3000)

## Access URLs

- **Guest App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:3000/api

## Admin Login

Default credentials:
- Email: `admin@thefork.com`
- Password: `admin123`

## Project Structure

```
├── backend/              # NestJS API server
├── guest-app/           # Next.js app (guest + admin merged)
│   └── src/app/
│       ├── /            # Guest routes (menu, cart, orders)
│       └── admin/       # Admin routes (dashboard, management)
└── admin-dashboard/     # (deprecated - merged into guest-app)
```

## Individual Commands

```bash
# Run only backend
npm run dev:backend

# Run only frontend app
npm run dev:app

# Build all for production
npm run build:all
```
