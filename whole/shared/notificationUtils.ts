/**
 * Browser notification utilities
 */

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  return (
    'Notification' in window &&
    Notification.permission === 'granted'
  );
}

/**
 * Show a browser notification
 */
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export function showNotification(options: NotificationOptions): Notification | null {
  if (!canShowNotifications()) {
    return null;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/icon.png',
    badge: options.badge,
    tag: options.tag,
    requireInteraction: options.requireInteraction ?? true,
    silent: options.silent ?? false,
  });

  // Vibrate if supported and pattern provided
  if (options.vibrate && 'vibrate' in navigator) {
    navigator.vibrate(options.vibrate);
  }

  return notification;
}

/**
 * Show notification for new order
 */
export function notifyNewOrder(orderNumber: string, tableNumber: string): void {
  showNotification({
    title: '🔔 New Order!',
    body: `Order #${orderNumber} - Table ${tableNumber}`,
    tag: `order-${orderNumber}`,
    vibrate: [200, 100, 200, 100, 200],
  });
}

/**
 * Show notification for order update
 */
export function notifyOrderUpdate(orderNumber: string, tableNumber: string, itemCount: number): void {
  showNotification({
    title: '📝 Order Updated',
    body: `Order #${orderNumber} - Table ${tableNumber} - ${itemCount} item(s) added`,
    tag: `order-${orderNumber}`,
    vibrate: [200, 100, 200],
  });
}

/**
 * Show notification for order status change
 */
export function notifyOrderStatus(orderNumber: string, status: string): void {
  const statusMessages: Record<string, string> = {
    confirmed: 'Order confirmed and being prepared',
    preparing: 'Order is being prepared in the kitchen',
    ready: 'Order is ready and will be served shortly',
    served: 'Order has been served. Enjoy your meal!',
    completed: 'Thank you for dining with us!',
  };

  const message = statusMessages[status] || `Order status: ${status}`;

  showNotification({
    title: `Order #${orderNumber}`,
    body: message,
    tag: `order-${orderNumber}-status`,
    vibrate: [200],
  });
}

/**
 * Initialize notifications (request permission on first load)
 */
export function initializeNotifications(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    requestNotificationPermission();
  }
}
