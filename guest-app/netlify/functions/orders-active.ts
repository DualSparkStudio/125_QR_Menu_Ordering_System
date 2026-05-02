import { Handler } from '@netlify/functions';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  const pathParts = event.path.split('/');
  const tableId = pathParts[pathParts.indexOf('tables') + 1];

  try {
    const orders = await prisma.order.findMany({
      where: { tableId, status: { in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] } },
      include: { 
        items: { include: { menuItem: true } },
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            taxPercentage: true,
            serviceChargePercentage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(orders);
  } catch (err: any) {
    console.error('Get active orders error:', err);
    return error(err.message || 'Failed to fetch active orders', 500);
  }
};
