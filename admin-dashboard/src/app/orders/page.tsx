'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-purple-100 text-purple-700',
  served: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'completed',
};

export default function OrdersPage() {
  const { staff, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    try {
      const data: any = await adminApi.getOrders(staff.restaurantId, token, filter ? { status: filter } : {});
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, staff, token]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [filter, staff, token]);

  const advance = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next || !token) return;
    setUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, next, token);
      await load();
    } finally {
      setUpdating(null);
    }
  };

  const cancel = async (orderId: string) => {
    if (!token || !confirm('Cancel this order?')) return;
    setUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, 'cancelled', token);
      await load();
    } finally {
      setUpdating(null);
    }
  };

  const FILTERS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <button onClick={load} className="text-sm text-orange-500 hover:text-orange-600 font-medium">↻ Refresh</button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                      <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      <span className={`badge ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentStatus === 'completed' ? '✓ Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Table {order.table?.tableNumber} · {order.table?.section} · {order.items?.length} items
                      {order.guestName && ` · ${order.guestName}`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {order.items?.slice(0, 4).map((item: any) => (
                        <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {item.menuItem?.name} ×{item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 4 && <span className="text-xs text-gray-400">+{order.items.length - 4} more</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-lg">₹{order.totalAmount?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {NEXT_STATUS[order.status] && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => advance(order.id, order.status)}
                      disabled={updating === order.id}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl transition-all disabled:opacity-60"
                    >
                      {updating === order.id ? '...' : `Mark as ${NEXT_STATUS[order.status]}`}
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancel(order.id)}
                        disabled={updating === order.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
