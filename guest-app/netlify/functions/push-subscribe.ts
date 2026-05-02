import { Handler } from '@netlify/functions';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const { subscription, userType, userId } = JSON.parse(event.body || '{}');

    if (!subscription || !userType || !userId) {
      return error('Missing required fields', 400);
    }

    // Store subscription in database
    // Note: You'll need to add a PushSubscription table to your schema
    // For now, we'll just log it
    console.log('Push subscription received:', {
      userType,
      userId,
      endpoint: subscription.endpoint,
    });

    // TODO: Store in database
    // await prisma.pushSubscription.upsert({
    //   where: { userId_userType: { userId, userType } },
    //   create: {
    //     userId,
    //     userType,
    //     endpoint: subscription.endpoint,
    //     keys: JSON.stringify(subscription.keys),
    //   },
    //   update: {
    //     endpoint: subscription.endpoint,
    //     keys: JSON.stringify(subscription.keys),
    //   },
    // });

    return success({ message: 'Subscription saved' });
  } catch (err: any) {
    console.error('Push subscribe error:', err);
    return error(err.message || 'Failed to save subscription', 500);
  }
};
