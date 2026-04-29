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
    const { status, tableId, date } = event.queryStringParameters || {};

    const where: any = { restaurantId };
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;
    if (date) {
      const d = new Date(date);
      where.createdAt = { gte: d, lt: new Date(d.getTime() + 86400000) };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, image: true } } } },
        table: { select: { id: true, tableNumber: true, section: true } },
        payment: { select: { id: true, status: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(orders);
  } catch (err: any) {
    console.error('List orders error:', err);
    return error(err.message || 'Failed to fetch orders', 500);
  }
};
