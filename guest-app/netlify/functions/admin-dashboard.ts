import { Handler } from '@netlify/functions';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';
import { getAuthUser } from './lib/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  const user = getAuthUser(event);
  if (!user) return error('Unauthorized', 401);

  const pathParts = event.path.split('/');
  const restaurantId = pathParts[pathParts.indexOf('restaurants') + 1];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders,
      todayOrders,
      activeOrders,
      totalRevenue,
      todayRevenue,
      totalTables,
      occupiedTables,
    ] = await Promise.all([
      prisma.order.count({ where: { restaurantId } }),
      prisma.order.count({ where: { restaurantId, createdAt: { gte: today, lt: tomorrow } } }),
      prisma.order.count({ where: { restaurantId, status: { in: ['pending', 'confirmed', 'preparing', 'ready'] } } }),
      prisma.order.aggregate({ where: { restaurantId, status: 'completed' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { restaurantId, status: 'completed', createdAt: { gte: today, lt: tomorrow } }, _sum: { totalAmount: true } }),
      prisma.table.count({ where: { restaurantId, deletedAt: null } }),
      prisma.table.count({ where: { restaurantId, status: 'occupied', deletedAt: null } }),
    ]);

    return success({
      totalOrders,
      todayOrders,
      activeOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      totalTables,
      occupiedTables,
      availableTables: totalTables - occupiedTables,
    });
  } catch (err: any) {
    console.error('Dashboard error:', err);
    return error(err.message || 'Failed to fetch dashboard stats', 500);
  }
};
