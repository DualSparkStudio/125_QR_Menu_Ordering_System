import { Handler } from '@netlify/functions';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';
import { getAuthUser } from './lib/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  const pathParts = event.path.split('/');
  const restaurantId = pathParts[pathParts.indexOf('restaurants') + 1];
  const isAdmin = event.path.includes('/admin');

  try {
    if (event.httpMethod === 'GET') {
      // GET /restaurants/:restaurantId/menu/categories or /categories/admin
      const categories = await prisma.category.findMany({
        where: { restaurantId, deletedAt: null },
        include: {
          items: {
            where: { 
              deletedAt: null,
              ...(isAdmin ? {} : { isAvailable: true })
            },
            include: { variants: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });
      return success(categories);
    }

    if (event.httpMethod === 'POST') {
      // POST /restaurants/:restaurantId/menu/categories
      const user = getAuthUser(event);
      if (!user) return error('Unauthorized', 401);

      const body = JSON.parse(event.body || '{}');
      const { name, description, displayOrder, image } = body;

      if (!name) return error('Name is required', 400);

      const existing = await prisma.category.findFirst({
        where: { restaurantId, name, deletedAt: null },
      });
      if (existing) return error('Category already exists', 400);

      const category = await prisma.category.create({
        data: { name, description, displayOrder, image, restaurantId },
      });
      return success(category, 201);
    }

    return error('Method not allowed', 405);
  } catch (err: any) {
    console.error('Menu categories error:', err);
    return error(err.message || 'Failed to process request', 500);
  }
};
