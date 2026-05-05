'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const FILTERS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
const FILTER_LABELS: Record<string, string> = {
  '': 'All', pending: 'Pending', confirmed: 'Confirmed', preparing: 'Cooking',
  ready: 'Ready', served: 'Served', completed: 'Done', cancelled: 'Cancelled',
};
const STATUS_OPTIONS = [
  { value: 'pending', label: '🕐 Pending' },
  { value: 'confirmed', label: '✓ Confirmed' },
  { value: 'preparing', label: '👨‍🍳 Cooking' },
  { value: 'ready', label: '🔔 Ready' },
  { value: 'served', label: '🍽️ Served' },
  { value: 'completed', label: '✅ Completed' },
  { value: 'cancelled', label: '✕ Cancelled' },
];
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600', confirmed: 'text-blue-600', preparing: 'text-orange-600',
  ready: 'text-green-600', served: 'text-purple-600', completed: 'text-gray-500', cancelled: 'text-red-500',
};

export default function OrdersPage() {
  const { staff, token, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/admin';
    }
  }, [isAuthenticated, loading]);

  const load = async () => {
    if (!staff?.restaurantId || !token) { setLoading(false); return; }
    try {
      const data: any = await adminApi.getOrders(staff.restaurantId, token, filter ? { status: filter } : {});
      setOrders(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, staff, token]);
  useEffect(() => {
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [filter, staff, token]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!token) return;
    setUpdating(id);
    try { await adminApi.updateOrderStatus(id, newStatus, token); await load(); } finally { setUpdating(null); }
  };

  const markPaid = async (id: string) => {
    if (!token) return;
    setUpdating(id);
    try { await adminApi.markAsPaid(id, token); await load(); } finally { setUpdating(null); }
  };

  const printBill = (order: any) => {
    const r = order.restaurant;
    if (!r) { alert('Unable to load restaurant details. Please refresh.'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const billImage = staff?.restaurantId ? localStorage.getItem(`billImage_${staff.restaurantId}`) : null;
    const billImageLabel = staff?.restaurantId ? (localStorage.getItem(`billImageLabel_${staff.restaurantId}`) || 'Scan to Pay') : 'Scan to Pay';
    const itemsHTML = order.items?.map((item: any) =>
      `<div class="item"><div class="item-left"><div class="item-name">${item.menuItem?.name || 'Item'}</div><div class="item-qty">x${item.quantity} @ ₹${item.price.toFixed(2)}</div></div><span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span></div>`
    ).join('') || '';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bill</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;width:80mm;max-width:80mm;margin:0 auto;padding:4mm;font-size:11px;line-height:1.4}.center{text-align:center}.bold{font-weight:bold}.header{text-align:center;margin-bottom:6px}.header h1{font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px}.header p{font-size:10px;margin:1px 0}.dashed{border-top:1px dashed #000;margin:5px 0}.order-meta{font-size:10px;margin:4px 0;text-align:center}.order-meta p{margin:2px 0}.items{margin:4px 0}.item{display:flex;justify-content:space-between;align-items:flex-start;margin:3px 0;font-size:11px}.item-left{flex:1;padding-right:4px}.item-name{font-weight:bold}.item-qty{color:#444;font-size:10px}.item-price{white-space:nowrap;font-weight:bold}.summary{margin:4px 0}.summary-row{display:flex;justify-content:space-between;margin:2px 0;font-size:11px}.summary-row.total{font-weight:bold;font-size:13px;margin-top:4px;padding-top:3px;border-top:1px solid #000}.payment-badge{text-align:center;border:2px solid #000;padding:4px;margin:6px 0;font-size:12px;font-weight:bold;letter-spacing:1px}.footer{text-align:center;margin-top:6px;font-size:10px}.footer p{margin:2px 0}@media print{html,body{width:80mm}@page{size:80mm auto;margin:0}}</style></head><body>
    <div class="header"><h1>${r.name || 'Restaurant'}</h1>${r.address ? `<p>${r.address}</p>` : ''}${r.phone ? `<p>Tel: ${r.phone}</p>` : ''}</div>
    <div class="dashed"></div>
    <div class="order-meta"><p class="bold">ORDER #${order.orderNumber?.slice(-8)}</p><p>Table ${order.table?.tableNumber} | ${order.table?.section || 'Main'}</p><p>${new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
    <div class="dashed"></div>
    <div class="items"><div class="item bold" style="font-size:10px;color:#555;margin-bottom:3px;"><span class="item-left">ITEM</span><span>AMT</span></div>${itemsHTML}</div>
    <div class="dashed"></div>
    <div class="summary"><div class="summary-row"><span>Subtotal</span><span>₹${(order.subtotal || 0).toFixed(2)}</span></div>${(order.taxAmount || 0) > 0 ? `<div class="summary-row"><span>Tax</span><span>₹${(order.taxAmount || 0).toFixed(2)}</span></div>` : ''}${(order.serviceCharge || 0) > 0 ? `<div class="summary-row"><span>Service</span><span>₹${(order.serviceCharge || 0).toFixed(2)}</span></div>` : ''}${(order.discountAmount || 0) > 0 ? `<div class="summary-row"><span>Discount</span><span>-₹${(order.discountAmount || 0).toFixed(2)}</span></div>` : ''}<div class="summary-row total"><span>TOTAL</span><span>₹${(order.totalAmount || 0).toFixed(2)}</span></div></div>
    <div class="payment-badge">${order.paymentStatus === 'completed' ? '*** PAID ***' : 'UNPAID — PAY AT COUNTER'}</div>
    <div class="dashed"></div>
    <div class="footer"><p>Thank you for dining with us!</p><p>Please visit again</p>${billImage ? `<div style="margin-top:8px;"><div class="dashed"></div><p style="font-size:10px;font-weight:bold;margin-bottom:4px;">${billImageLabel}</p><img src="${billImage}" style="width:48mm;height:48mm;object-fit:contain;display:block;margin:0 auto;" /></div>` : ''}</div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const activeCount = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Please log in to view orders</p>
        <a href="/admin" className="btn-primary">Go to Login</a>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Orders</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {activeCount > 0 ? <span className="text-orange-500 font-semibold">{activeCount} active</span> : 'No active orders'}
            {' '}· {lastRefresh.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">↻ Refresh</button>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count = f ? orders.filter((o) => o.status === f).length : orders.length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-300'}`}>
              {FILTER_LABELS[f]}
              {count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === f ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-400 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const age = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isUrgent = age > 20 && ['pending', 'confirmed', 'preparing'].includes(order.status);
            const isNew = age < 2; // New if less than 2 minutes old
            const hasRecentItems = order.items?.some((item: any) => {
              const itemAge = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
              return itemAge < 2;
            });
            
            // Determine card background color
            let cardBgClass = 'bg-white';
            let borderClass = 'border-gray-200';
            if (isUrgent) {
              cardBgClass = 'bg-red-50';
              borderClass = 'border-red-300';
            } else if (isNew) {
              cardBgClass = 'bg-green-50';
              borderClass = 'border-green-300';
            } else if (hasRecentItems && !isNew) {
              cardBgClass = 'bg-blue-50';
              borderClass = 'border-blue-300';
            }
            
            return (
              <div key={order.id} className={`card overflow-hidden ${cardBgClass} border-2 ${borderClass}`}>
                <div className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-black text-gray-900 text-sm">#{order.orderNumber?.slice(-10)}</span>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                      <span className={`badge ${order.paymentStatus === 'completed' ? 'badge-paid' : 'badge-unpaid'}`}>
                        {order.paymentStatus === 'completed' ? '✓ Paid' : 'Unpaid'}
                      </span>
                      {isUrgent && <span className="badge bg-red-100 text-red-700 border border-red-300 font-bold">⚠ {age}m DELAYED</span>}
                      {isNew && <span className="badge bg-green-100 text-green-700 border border-green-300 font-bold">🆕 NEW</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 flex-wrap">
                      <span>Table {order.table?.tableNumber}</span>
                      <span className="capitalize">· {order.table?.section}</span>
                      {order.guestName && <span>· {order.guestName}</span>}
                      <span>· {new Date(order.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="space-y-2">
                      {order.items?.map((item: any) => {
                        const itemAge = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
                        const isNewItem = itemAge < 2 && !isNew; // New item in existing order
                        return (
                          <div key={item.id} className={`flex items-center gap-2 ${isNewItem ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-100'} rounded-lg p-2`}>
                            {isNewItem && <span className="text-blue-500 text-xs">🆕</span>}
                            <span className="text-gray-400 text-xs">×{item.quantity}</span>
                            <span className="flex-1 text-gray-700 text-xs font-medium">{item.menuItem?.name}</span>
                            <select
                              value={item.status || 'pending'}
                              onChange={(e) => {
                                if (!token) return;
                                setUpdating(item.id);
                                adminApi.updateItemStatus(item.id, e.target.value, token)
                                  .then(() => load())
                                  .finally(() => setUpdating(null));
                              }}
                              disabled={updating === item.id}
                              className="text-xs px-2 py-1 rounded border border-gray-200 bg-white cursor-pointer focus:outline-none focus:border-orange-400 disabled:opacity-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="served">Served</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                    {order.specialInstructions && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mt-2">
                        📝 {order.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="font-black text-gray-900 text-lg">₹{order.totalAmount?.toFixed(0)}</p>
                    <div className="flex gap-1.5 flex-wrap justify-end items-center">
                      <button onClick={() => printBill(order)} className="btn-secondary text-xs px-3 py-2">🖨️ Bill</button>
                      {order.status === 'completed' && order.paymentStatus !== 'completed' && (
                        <button onClick={() => markPaid(order.id)} disabled={updating === order.id}
                          className="text-xs font-semibold px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50">
                          💰 Mark Paid
                        </button>
                      )}
                      <select value={order.status} disabled={updating === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white cursor-pointer focus:outline-none focus:border-orange-400 transition-all disabled:opacity-50 ${STATUS_COLORS[order.status]}`}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value} className="text-gray-700">{s.label}</option>
                        ))}
                      </select>
                      {updating === order.id && <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />}
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
