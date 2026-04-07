const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Restaurant
  getRestaurantBySlug: (slug: string) => req(`/restaurants/slug/${slug}`),
  getRestaurantById: (id: string) => req(`/restaurants/${id}`),

  // Table
  getTableByQR: (restaurantId: string, qrCode: string) => req(`/restaurants/${restaurantId}/tables/qr/${qrCode}`),

  // Table session
  createTableSession: (tableId: string, data?: { guestName?: string; guestPhone?: string; guestCount?: number }) =>
    req('/auth/table/session', { method: 'POST', body: JSON.stringify({ tableId, ...data }) }),

  // Menu
  getCategories: (restaurantId: string) => req(`/restaurants/${restaurantId}/menu/categories`),
  getFeaturedItems: (restaurantId: string) => req(`/restaurants/${restaurantId}/menu/items/featured`),
  getMenuItems: (restaurantId: string, categoryId?: string) =>
    req(`/restaurants/${restaurantId}/menu/items${categoryId ? `?categoryId=${categoryId}` : ''}`),

  // Orders
  createOrder: (restaurantId: string, tableId: string, data: any) =>
    req(`/restaurants/${restaurantId}/tables/${tableId}/orders`, { method: 'POST', body: JSON.stringify(data) }),
  getActiveOrders: (tableId: string) => req(`/tables/${tableId}/orders/active`),
  getOrder: (id: string) => req(`/orders/${id}`),

  // Waiter calls
  callWaiter: (restaurantId: string, tableId: string, data: { type: string; note?: string }) =>
    req(`/restaurants/${restaurantId}/tables/${tableId}/waiter-calls`, { method: 'POST', body: JSON.stringify(data) }),

  // Coupons
  validateCoupon: (restaurantId: string, code: string, orderTotal: number) =>
    req(`/restaurants/${restaurantId}/coupons/validate`, { method: 'POST', body: JSON.stringify({ code, orderTotal }) }),

  // Payments
  createRazorpayOrder: (orderId: string) => req(`/payments/razorpay/create/${orderId}`, { method: 'POST' }),
  verifyRazorpayPayment: (data: any) => req('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Reviews
  submitReview: (restaurantId: string, orderId: string, data: any) =>
    req(`/restaurants/${restaurantId}/reviews/orders/${orderId}`, { method: 'POST', body: JSON.stringify(data) }),
};
