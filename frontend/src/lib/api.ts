const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function req<T>(url: string, options?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    req('/auth/staff/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Restaurant
  getRestaurant: (id: string, token: string) => req(`/restaurants/${id}`, {}, token),
  updateRestaurant: (id: string, data: any, token: string) =>
    req(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  // Dashboard
  getDashboard: (restaurantId: string, token: string) =>
    req(`/admin/restaurants/${restaurantId}/dashboard`, {}, token),
  getRevenue: (restaurantId: string, token: string, startDate?: string, endDate?: string) =>
    req(`/admin/restaurants/${restaurantId}/revenue?${startDate ? `startDate=${startDate}&` : ''}${endDate ? `endDate=${endDate}` : ''}`, {}, token),

  // Tables
  getTables: (restaurantId: string, token: string) =>
    req(`/restaurants/${restaurantId}/tables`, {}, token),
  createTable: (restaurantId: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/tables`, { method: 'POST', body: JSON.stringify(data) }, token),
  updateTable: (restaurantId: string, id: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  updateTableStatus: (restaurantId: string, id: string, status: string, token: string) =>
    req(`/restaurants/${restaurantId}/tables/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token),
  deleteTable: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/tables/${id}`, { method: 'DELETE' }, token),
  regenerateQR: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/tables/${id}/regenerate-qr`, { method: 'PUT' }, token),

  // Menu
  getCategories: (restaurantId: string, token: string) =>
    req(`/restaurants/${restaurantId}/menu/categories/admin`, {}, token),
  createCategory: (restaurantId: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/menu/categories`, { method: 'POST', body: JSON.stringify(data) }, token),
  updateCategory: (restaurantId: string, id: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/menu/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteCategory: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/menu/categories/${id}`, { method: 'DELETE' }, token),
  createMenuItem: (restaurantId: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/menu/items`, { method: 'POST', body: JSON.stringify(data) }, token),
  updateMenuItem: (restaurantId: string, id: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  toggleItemAvailability: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/menu/items/${id}/toggle-availability`, { method: 'PUT' }, token),
  deleteMenuItem: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/menu/items/${id}`, { method: 'DELETE' }, token),

  // Orders
  getOrders: (restaurantId: string, token: string, filters?: any) => {
    const params = new URLSearchParams(filters || {});
    return req(`/restaurants/${restaurantId}/orders?${params}`, {}, token);
  },
  getOrder: (id: string, token: string) => req(`/orders/${id}`, {}, token),
  updateOrderStatus: (id: string, status: string, token: string) =>
    req(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, token),

  // Waiter calls
  getWaiterCalls: (restaurantId: string, token: string, status?: string) =>
    req(`/restaurants/${restaurantId}/waiter-calls${status ? `?status=${status}` : ''}`, {}, token),
  updateWaiterCall: (id: string, data: any, token: string) =>
    req(`/waiter-calls/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  // Staff
  getStaff: (restaurantId: string, token: string) =>
    req(`/admin/restaurants/${restaurantId}/staff`, {}, token),
  createStaff: (restaurantId: string, data: any, token: string) =>
    req(`/admin/restaurants/${restaurantId}/staff`, { method: 'POST', body: JSON.stringify(data) }, token),
  updateStaff: (restaurantId: string, id: string, data: any, token: string) =>
    req(`/admin/restaurants/${restaurantId}/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteStaff: (restaurantId: string, id: string, token: string) =>
    req(`/admin/restaurants/${restaurantId}/staff/${id}`, { method: 'DELETE' }, token),

  // Coupons
  getCoupons: (restaurantId: string, token: string) =>
    req(`/restaurants/${restaurantId}/coupons`, {}, token),
  createCoupon: (restaurantId: string, data: any, token: string) =>
    req(`/restaurants/${restaurantId}/coupons`, { method: 'POST', body: JSON.stringify(data) }, token),
  toggleCoupon: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/coupons/${id}/toggle`, { method: 'PUT' }, token),
  deleteCoupon: (restaurantId: string, id: string, token: string) =>
    req(`/restaurants/${restaurantId}/coupons/${id}`, { method: 'DELETE' }, token),

  // Reviews
  getReviews: (restaurantId: string, token: string) =>
    req(`/restaurants/${restaurantId}/reviews`, {}, token),
  getReviewStats: (restaurantId: string, token: string) =>
    req(`/restaurants/${restaurantId}/reviews/stats`, {}, token),

  // Reports
  getSalesReport: (restaurantId: string, token: string, startDate: string, endDate: string) =>
    req(`/restaurants/${restaurantId}/reports/sales?startDate=${startDate}&endDate=${endDate}`, {}, token),
};
