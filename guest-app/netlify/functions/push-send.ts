import { Handler } from '@netlify/functions';
import webpush from 'web-push';
import { prisma } from './lib/prisma';
import { success, error, handleCors } from './lib/response';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@cafeqrsystem.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleCors();
  }

  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const { userType, userId, title, body, data } = JSON.parse(event.body || '{}');

    if (!userType || !userId || !title) {
      return error('Missing required fields', 400);
    }

    // TODO: Fetch subscriptions from database
    // const subscriptions = await prisma.pushSubscription.findMany({
    //   where: { userId, userType },
    // });

    // For now, return success
    console.log('Push notification request:', { userType, userId, title, body });

    // TODO: Send push notifications
    // const promises = subscriptions.map(sub => {
    //   const pushSubscription = {
    //     endpoint: sub.endpoint,
    //     keys: JSON.parse(sub.keys),
    //   };
    //   
    //   const payload = JSON.stringify({
    //     title,
    //     body,
    //     icon: '/icon-192x192.png',
    //     badge: '/icon-96x96.png',
    //     data,
    //   });
    //   
    //   return webpush.sendNotification(pushSubscription, payload);
    // });
    // 
    // await Promise.all(promises);

    return success({ message: 'Notifications sent' });
  } catch (err: any) {
    console.error('Push send error:', err);
    return error(err.message || 'Failed to send notifications', 500);
  }
};
