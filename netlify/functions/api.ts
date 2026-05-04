import { Handler, HandlerEvent } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

let prisma: PrismaClient;

const getPrisma = () => {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    prisma = new PrismaClient();
  }
  return prisma;
};
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
  body: JSON.stringify(body),
});

const parseBody = (event: HandlerEvent) => {
  try { return event.body ? JSON.parse(event.body) : {}; } catch { return {}; }
};

const getToken = (event: HandlerEvent) => {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const parts = auth.split(' ');
  return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
};

const verifyToken = (token: string) => {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
};

// Extract path params from pattern matching
const matchPath = (pattern: string, path: string): Record<string, string> | null => {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});

  // Early check for required env vars
  if (!process.env.DATABASE_URL) {
    return json(500, { message: 'DATABASE_URL is not configured. Set it in Netlify environment variables.' });
  }
  if (!process.env.JWT_SECRET) {
    return json(500, { message: 'JWT_SECRET is not configured. Set it in Netlify environment variables.' });
  }

  // Netlify passes the original path (e.g. /api/auth/staff/login) not the function path
  const rawPath = (event.path || '/')
    .replace('/.netlify/functions/api', '')
    .replace(/^\/api/, '') || '/';

  console.log(`[api] ${event.httpMethod} ${event.path} → rawPath: ${rawPath}`);
  const method = event.httpMethod;
  const body = parseBody(event);
  const tokenStr = getToken(event);
  const token = tokenStr ? verifyToken(tokenStr) : null;
  const q = event.queryStringParameters || {};

  try {
    // ── AUTH ──────────────────────────────────────────────────────────────
    if (method === 'POST' && rawPath === '/auth/staff/login') {
      const { email, password } = body;
      if (!email || !password) return json(400, { message: 'Email and password required' });

      const staff = await getPrisma().staff.findFirst({ where: { email } });
      if (!staff) return json(401, { message: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, staff.passwordHash);
      if (!valid) return json(401, { message: 'Invalid credentials' });
      if (!staff.isActive) return json(401, { message: 'Account inactive' });

      const payload = { sub: staff.id, email: staff.email, role: staff.role, restaurantId: staff.restaurantId };
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      await getPrisma().staff.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });

      return json(200, {
        accessToken, refreshToken,
        staff: { id: staff.id, email: staff.email, name: staff.name, role: staff.role, restaurantId: staff.restaurantId },
      });
    }

    if (method === 'POST' && rawPath === '/auth/table/session') {
      const { tableId, guestName, guestPhone, guestCount } = body;
      if (!tableId) return json(400, { message: 'tableId required' });
      const table = await getPrisma().table.findUnique({ where: { id: tableId } });
      if (!table) return json(404, { message: 'Table not found' });
      const sessionToken = uuidv4();
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
      await getPrisma().tableSession.create({ data: { tableId, sessionToken, guestName, guestPhone, guestCount: guestCount || 1, expiresAt } });
      return json(200, { sessionToken, tableId, restaurantId: table.restaurantId, expiresAt });
    }

    if (method === 'POST' && rawPath === '/auth/refresh') {
      const { refreshToken } = body;
      if (!refreshToken) return json(400, { message: 'refreshToken required' });
      const payload: any = verifyToken(refreshToken);
      if (!payload) return json(401, { message: 'Invalid refresh token' });
      const accessToken = jwt.sign({ sub: payload.sub, email: payload.email, role: payload.role, restaurantId: payload.restaurantId }, JWT_SECRET, { expiresIn: '24h' });
      return json(200, { accessToken });
    }

    // ── RESTAURANTS ───────────────────────────────────────────────────────
    let p = matchPath('/restaurants/:id', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'GET') {
        const r = await getPrisma().restaurant.findUnique({ where: { id: p.id } });
        if (!r) return json(404, { message: 'Not found' });
        return json(200, r);
      }
      if (method === 'PUT') {
        const r = await getPrisma().restaurant.update({ where: { id: p.id }, data: body });
        return json(200, r);
      }
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────
    p = matchPath('/admin/restaurants/:restaurantId/dashboard', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const rid = p.restaurantId;
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      const db = getPrisma();
      const [
        totalTables, occupiedTables, availableTables,
        todayOrders, pendingOrders,
        todayRevenue, totalRevenue,
        pendingWaiterCalls,
        reviewStats,
      ] = await Promise.all([
        db.table.count({ where: { restaurantId: rid, isActive: true } }),
        db.table.count({ where: { restaurantId: rid, status: 'occupied' } }),
        db.table.count({ where: { restaurantId: rid, status: 'available' } }),
        db.order.count({ where: { restaurantId: rid, createdAt: { gte: today } } }),
        db.order.count({ where: { restaurantId: rid, status: { in: ['pending', 'confirmed', 'preparing', 'ready'] } } }),
        db.order.aggregate({ where: { restaurantId: rid, status: 'completed', createdAt: { gte: today } }, _sum: { totalAmount: true } }),
        db.order.aggregate({ where: { restaurantId: rid, status: 'completed' }, _sum: { totalAmount: true } }),
        db.waiterCall.count({ where: { restaurantId: rid, status: 'pending' } }),
        db.review.aggregate({ where: { restaurantId: rid }, _avg: { foodRating: true, serviceRating: true } }),
      ]);
      return json(200, {
        tables: { total: totalTables, occupied: occupiedTables, available: availableTables },
        orders: { today: todayOrders, pending: pendingOrders },
        revenue: { today: todayRevenue._sum.totalAmount || 0, total: totalRevenue._sum.totalAmount || 0 },
        waiterCalls: { pending: pendingWaiterCalls },
        ratings: { food: reviewStats._avg.foodRating || 0, service: reviewStats._avg.serviceRating || 0 },
      });
    }

    // ── TABLES ────────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/tables', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'GET') {
        const tables = await getPrisma().table.findMany({ where: { restaurantId: p.restaurantId }, orderBy: { tableNumber: 'asc' } });
        return json(200, tables);
      }
      if (method === 'POST') {
        const table = await getPrisma().table.create({ data: { ...body, restaurantId: p.restaurantId } });
        return json(200, table);
      }
    }

    p = matchPath('/restaurants/:restaurantId/tables/:id', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'PUT') {
        const table = await getPrisma().table.update({ where: { id: p.id }, data: body });
        return json(200, table);
      }
      if (method === 'DELETE') {
        await getPrisma().table.delete({ where: { id: p.id } });
        return json(200, { message: 'Deleted' });
      }
    }

    // ── MENU ──────────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/menu/categories/admin', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const cats = await getPrisma().category.findMany({ where: { restaurantId: p.restaurantId }, include: { items: true }, orderBy: { displayOrder: 'asc' } });
      return json(200, cats);
    }

    p = matchPath('/restaurants/:restaurantId/menu/categories', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'POST') {
        const cat = await getPrisma().category.create({ data: { ...body, restaurantId: p.restaurantId } });
        return json(200, cat);
      }
    }

    p = matchPath('/restaurants/:restaurantId/menu/categories/:id', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'PUT') {
        const cat = await getPrisma().category.update({ where: { id: p.id }, data: body });
        return json(200, cat);
      }
      if (method === 'DELETE') {
        await getPrisma().category.delete({ where: { id: p.id } });
        return json(200, { message: 'Deleted' });
      }
    }

    p = matchPath('/restaurants/:restaurantId/menu/items', rawPath);
    if (p && method === 'POST') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const item = await getPrisma().menuItem.create({ data: { ...body, restaurantId: p.restaurantId } });
      return json(200, item);
    }

    p = matchPath('/restaurants/:restaurantId/menu/items/:id/toggle-availability', rawPath);
    if (p && method === 'PUT') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const item = await getPrisma().menuItem.findUnique({ where: { id: p.id } });
      if (!item) return json(404, { message: 'Not found' });
      const updated = await getPrisma().menuItem.update({ where: { id: p.id }, data: { isAvailable: !item.isAvailable } });
      return json(200, updated);
    }

    p = matchPath('/restaurants/:restaurantId/menu/items/:id', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'PUT') {
        const item = await getPrisma().menuItem.update({ where: { id: p.id }, data: body });
        return json(200, item);
      }
      if (method === 'DELETE') {
        await getPrisma().menuItem.delete({ where: { id: p.id } });
        return json(200, { message: 'Deleted' });
      }
    }

    // ── ORDERS ────────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/orders', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const where: any = { restaurantId: p.restaurantId };
      if (q.status) where.status = q.status;
      if (q.tableId) where.tableId = q.tableId;
      console.log(`[orders] fetching for restaurantId: ${p.restaurantId}, filter:`, where);
      const db = getPrisma();
      const totalCount = await db.order.count({});
      const matchCount = await db.order.count({ where: { restaurantId: p.restaurantId } });
      console.log(`[orders] total orders in DB: ${totalCount}, matching restaurantId: ${matchCount}`);
      const orders = await getPrisma().order.findMany({
        where,
        include: {
          items: { include: { menuItem: { select: { id: true, name: true, image: true } } } },
          table: { select: { id: true, tableNumber: true, section: true } },
          restaurant: { select: { id: true, name: true, address: true, phone: true, email: true, taxPercentage: true, serviceChargePercentage: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return json(200, orders);
    }

    p = matchPath('/orders/:id/mark-paid', rawPath);
    if (p && method === 'PUT') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const updated = await getPrisma().order.update({ where: { id: p.id }, data: { paymentStatus: 'completed' } });
      return json(200, updated);
    }

    p = matchPath('/orders/:id/status', rawPath);
    if (p && method === 'PUT') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const { status } = body;
      const updated = await getPrisma().order.update({ where: { id: p.id }, data: { status } });
      return json(200, updated);
    }

    p = matchPath('/orders/:id', rawPath);
    if (p && method === 'GET') {
      const order = await getPrisma().order.findUnique({
        where: { id: p.id },
        include: { items: { include: { menuItem: true } }, table: true },
      });
      if (!order) return json(404, { message: 'Not found' });
      return json(200, order);
    }

    // ── STAFF ─────────────────────────────────────────────────────────────
    p = matchPath('/admin/restaurants/:restaurantId/staff', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'GET') {
        const staff = await getPrisma().staff.findMany({
          where: { restaurantId: p.restaurantId },
          select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
        });
        return json(200, staff);
      }
      if (method === 'POST') {
        const { email, name, role, password, phone } = body;
        const passwordHash = await bcrypt.hash(password, 10);
        const staff = await getPrisma().staff.create({ data: { email, name, role, phone: phone || '', passwordHash, restaurantId: p.restaurantId } });
        return json(200, { id: staff.id, email: staff.email, name: staff.name, role: staff.role });
      }
    }

    p = matchPath('/admin/restaurants/:restaurantId/staff/:id', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'PUT') {
        const updateData: any = { ...body };
        if (body.password) { updateData.passwordHash = await bcrypt.hash(body.password, 10); delete updateData.password; }
        const staff = await getPrisma().staff.update({ where: { id: p.id }, data: updateData });
        return json(200, { id: staff.id, email: staff.email, name: staff.name, role: staff.role });
      }
      if (method === 'DELETE') {
        await getPrisma().staff.delete({ where: { id: p.id } });
        return json(200, { message: 'Deleted' });
      }
    }

    // ── COUPONS ───────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/coupons', rawPath);
    if (p) {
      if (!token) return json(401, { message: 'Unauthorized' });
      if (method === 'GET') {
        const coupons = await getPrisma().coupon.findMany({ where: { restaurantId: p.restaurantId }, orderBy: { createdAt: 'desc' } });
        return json(200, coupons);
      }
      if (method === 'POST') {
        const coupon = await getPrisma().coupon.create({ data: { ...body, restaurantId: p.restaurantId } });
        return json(200, coupon);
      }
    }

    p = matchPath('/restaurants/:restaurantId/coupons/:id/toggle', rawPath);
    if (p && method === 'PUT') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const coupon = await getPrisma().coupon.findUnique({ where: { id: p.id } });
      if (!coupon) return json(404, { message: 'Not found' });
      const updated = await getPrisma().coupon.update({ where: { id: p.id }, data: { isActive: !coupon.isActive } });
      return json(200, updated);
    }

    p = matchPath('/restaurants/:restaurantId/coupons/:id', rawPath);
    if (p && method === 'DELETE') {
      if (!token) return json(401, { message: 'Unauthorized' });
      await getPrisma().coupon.delete({ where: { id: p.id } });
      return json(200, { message: 'Deleted' });
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/reviews/stats', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const [total, avg] = await Promise.all([
        prisma.review.count({ where: { restaurantId: p.restaurantId } }),
        prisma.review.aggregate({ where: { restaurantId: p.restaurantId }, _avg: { foodRating: true, serviceRating: true } }),
      ]);
      return json(200, { totalReviews: total, averageFoodRating: avg._avg.foodRating || 0, averageServiceRating: avg._avg.serviceRating || 0 });
    }

    p = matchPath('/restaurants/:restaurantId/reviews', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const reviews = await getPrisma().review.findMany({ where: { restaurantId: p.restaurantId }, orderBy: { createdAt: 'desc' } });
      return json(200, reviews);
    }

    // ── REPORTS ───────────────────────────────────────────────────────────
    p = matchPath('/restaurants/:restaurantId/reports/sales', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const where: any = { restaurantId: p.restaurantId, status: 'completed' };
      if (q.startDate && q.endDate) where.createdAt = { gte: new Date(q.startDate), lte: new Date(q.endDate) };
      const [orders, agg] = await Promise.all([
        prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' } }),
        prisma.order.aggregate({ where, _sum: { totalAmount: true }, _count: true }),
      ]);
      return json(200, { orders, totalRevenue: agg._sum.totalAmount || 0, totalOrders: agg._count });
    }

    // ── REVENUE ───────────────────────────────────────────────────────────
    p = matchPath('/admin/restaurants/:restaurantId/revenue', rawPath);
    if (p && method === 'GET') {
      if (!token) return json(401, { message: 'Unauthorized' });
      const where: any = { restaurantId: p.restaurantId, status: 'completed' };
      if (q.startDate) where.createdAt = { ...where.createdAt, gte: new Date(q.startDate) };
      if (q.endDate) where.createdAt = { ...where.createdAt, lte: new Date(q.endDate) };
      const agg = await getPrisma().order.aggregate({ where, _sum: { totalAmount: true }, _count: true });
      return json(200, { totalRevenue: agg._sum.totalAmount || 0, totalOrders: agg._count });
    }

    return json(404, { message: `Route not found: ${method} ${rawPath}` });

  } catch (err: any) {
    console.error('Function error:', err);
    const status = err.message?.includes('Unauthorized') ? 401 : err.message?.includes('not found') ? 404 : 500;
    return json(status, { message: err.message || 'Internal server error' });
  }
};
