'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const NEXT: Record<string, string> = {
  pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'served', served: 'completed',
};
const NEXT_LABEL: Record<string, string> = {
  pending: '✓ Confirm', confirmed: '👨‍🍳 Cooking', preparing: '🔔 Ready', ready: '🍽️ Served', served: '✓ Complete',
};
const FILTERS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
const FILTER_LABELS: Record<string, string> = {
  '': 'All', pending: 'Pending', confirmed: 'Confirmed', preparing: 'Cooking',
  ready: 'Ready', served: 'Served', completed: 'Done', cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const { staff, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    const data: any = await adminApi.getOrders(staff.restaurantId, token, filter ? { status: filter } : {});
    setOrders(data);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, staff, token]);
  useEffect(() => { const t = setInterval(load, 20000); return () => clearInterval(t); }, [filter, staff, token]);

  const advance = async (id: string, status: string) => {
    const next = NEXT[status];
    if (!next || !token) return;
    setUpdating(id);
    try { await adminApi.updateOrderStatus(id, next, token); await load(); } finally { setUpdating(null); }
  };

  const cancel = async (id: string) => {
    if (!token || !confirm('Cancel this order?')) return;
    setUpdating(id);
    try { await adminApi.updateOrderStatus(id, 'cancelled', token); await load(); } finally { setUpdating(null); }
  };

  const activeCount = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-900">Orders</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {activeCount > 0
                ? <span className="text-orange-500 font-semibold">{activeCount} active</span>
                : 'No active orders'
              }
              {' '}· {lastRefresh.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={load} className="btn-secondary text-xs">↻ Refresh</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const count = f ? orders.filter((o) => o.status === f).length : orders.length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-300'
                }`}
              >
                {FILTER_LABELS[f]}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === f ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
        ) : orders.length === 0 ? (
          <div className="card py-20 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-400 font-medium">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const age = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
              const isUrgent = age > 20 && ['pending', 'confirmed', 'preparing'].includes(order.status);
              return (
                <div key={order.id} className={`card overflow-hidden ${isUrgent ? 'border-red-200' : ''}`}>
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-black text-gray-900 text-sm">#{order.orderNumber?.slice(-10)}</span>
                        <span className={`badge badge-${order.status}`}>{order.status}</span>
                        <span className={`badge ${order.paymentStatus === 'completed' ? 'badge-paid' : 'badge-unpaid'}`}>
                          {order.paymentStatus === 'completed' ? '✓ Paid' : 'Unpaid'}
                        </span>
                        {isUrgent && <span className="badge bg-red-50 text-red-600 border border-red-200">⚠ {age}m</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 flex-wrap">
                        <span>Table {order.table?.tableNumber}</span>
                        <span className="capitalize">· {order.table?.section}</span>
                        {order.guestName && <span>· {order.guestName}</span>}
                        <span>· {new Date(order.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {order.items?.map((item: any) => (
                          <span key={item.id} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg font-medium">
                            <span className="text-gray-400">×{item.quantity}</span> {item.menuItem?.name}
                          </span>
                        ))}
                      </div>
                      {order.specialInstructions && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mt-2">
                          📝 {order.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="font-black text-gray-900 text-lg">₹{order.totalAmount?.toFixed(0)}</p>
                      <div className="flex gap-1.5">
                        {NEXT[order.status] && (
                          <button onClick={() => advance(order.id, order.status)} disabled={updating === order.id}
                            className="btn-primary text-xs px-3 py-2">
                            {updating === order.id ? '...' : NEXT_LABEL[order.status]}
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button onClick={() => cancel(order.id)} disabled={updating === order.id}
                            className="btn-danger text-xs px-3 py-2">✕</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
