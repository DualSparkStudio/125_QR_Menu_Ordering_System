'use client';

import { useEffect, useState } from 'react';
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

  const markPaid = async (id: string) => {
    if (!token) return;
    setUpdating(id);
    try { await adminApi.markAsPaid(id, token); await load(); } finally { setUpdating(null); }
  };

  const printBill = (order: any) => {
    console.log('Starting printBill for order:', order.id);
    console.log('Order data:', order);

    // Use restaurant details from the order (already included in API response)
    const restaurantDetails = order.restaurant;

    if (!restaurantDetails) {
      console.error('No restaurant details in order!');
      alert('Unable to load restaurant details. Please refresh the page and try again.');
      return;
    }

    // Extract values to ensure they're properly evaluated
    const restaurantName = restaurantDetails.name || 'Restaurant';
    const restaurantAddress = restaurantDetails.address || '';
    const restaurantPhone = restaurantDetails.phone || '';
    const restaurantEmail = restaurantDetails.email || '';
    const taxPercentage = restaurantDetails.taxPercentage || 0;
    const serviceChargePercentage = restaurantDetails.serviceChargePercentage || 0;

    console.log('Restaurant details for bill:', {
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      restaurantEmail,
      taxPercentage,
      serviceChargePercentage
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Order #${order.orderNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; font-size: 14px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
          .restaurant { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .restaurant-info { font-size: 12px; margin: 2px 0; }
          .order-num { font-size: 14px; margin-bottom: 5px; font-weight: bold; }
          .table-info { font-size: 12px; margin-bottom: 5px; }
          .date { font-size: 11px; color: #666; }
          .items { margin: 15px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .item-name { flex: 1; }
          .item-qty { width: 40px; text-align: center; }
          .item-price { width: 80px; text-align: right; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .divider-thick { border-top: 2px solid #000; margin: 15px 0; }
          .totals { margin: 10px 0; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px; }
          .total-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
          .payment-status { text-align: center; margin: 20px 0; padding: 15px; border: 3px solid #000; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 20px; font-size: 13px; border-top: 2px dashed #000; padding-top: 15px; }
          @media print {
            body { padding: 10px; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant">${restaurantName}</div>
          ${restaurantAddress ? `<p class="restaurant-info">${restaurantAddress}</p>` : ''}
          ${restaurantPhone ? `<p class="restaurant-info">📞 ${restaurantPhone}</p>` : ''}
          ${restaurantEmail ? `<p class="restaurant-info">✉️ ${restaurantEmail}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 15px 0; padding: 10px 0; border-bottom: 2px dashed #000;">
          <div class="order-num">Order #${order.orderNumber}</div>
          <div class="table-info">Table ${order.table?.tableNumber} · ${order.table?.section || 'Main'}</div>
          <div class="date">${new Date(order.createdAt).toLocaleString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}</div>
        </div>

        <div class="divider-thick"></div>

        <div class="items">
          ${order.items?.map((item: any) => `
            <div class="item">
              <span class="item-name">${item.menuItem?.name}</span>
              <span class="item-qty">×${item.quantity}</span>
              <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="divider"></div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          ${(order.taxAmount || 0) > 0 ? `
            <div class="total-row">
              <span>Tax (${taxPercentage}%)</span>
              <span>₹${(order.taxAmount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          ${(order.serviceCharge || 0) > 0 ? `
            <div class="total-row">
              <span>Service Charge (${serviceChargePercentage}%)</span>
              <span>₹${(order.serviceCharge || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          ${(order.discountAmount || 0) > 0 ? `
            <div class="total-row">
              <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>-₹${(order.discountAmount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row grand">
            <span>TOTAL</span>
            <span>₹${(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="divider-thick"></div>

        <div class="payment-status">
          ${order.paymentStatus === 'completed' ? '✓ PAID' : 'UNPAID - Pay at Counter'}
        </div>

        <div class="divider-thick"></div>

        <div class="footer">
          <p>Thank you for dining with us!</p>
          <p>Visit again soon</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const activeCount = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  return (
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
                        {order.status === 'completed' && order.paymentStatus && (
                          <span className={`badge ${order.paymentStatus === 'completed' ? 'badge-paid' : 'badge-unpaid'}`}>
                            {order.paymentStatus === 'completed' ? '✓ Paid' : 'Unpaid'}
                          </span>
                        )}
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
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <button onClick={() => printBill(order)}
                          className="btn-ghost text-xs px-3 py-2 flex items-center gap-1">
                          🖨️ Bill
                        </button>
                        {order.status === 'completed' && order.paymentStatus !== 'completed' && (
                          <button onClick={() => markPaid(order.id)} disabled={updating === order.id}
                            className="btn-primary text-xs px-3 py-2 bg-green-500 hover:bg-green-600">
                            {updating === order.id ? '...' : '💰 Mark Paid'}
                          </button>
                        )}
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
  );
}
