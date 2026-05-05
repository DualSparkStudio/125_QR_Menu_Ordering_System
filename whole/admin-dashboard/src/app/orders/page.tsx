'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: '🕐 Pending',
  confirmed: '✓ Confirmed',
  preparing: '👨‍🍳 Cooking',
  ready: '🔔 Ready',
  served: '🍽️ Served',
  completed: '✅ Completed',
  cancelled: '✕ Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  preparing: 'text-orange-600',
  ready: 'text-green-600',
  served: 'text-purple-600',
  completed: 'text-gray-500',
  cancelled: 'text-red-500',
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

  const printBill = async (order: any) => {
    // Use restaurant from order, or fall back to fetching it
    let restaurantDetails = order.restaurant;

    if (!restaurantDetails && staff?.restaurantId && token) {
      try {
        restaurantDetails = await adminApi.getRestaurant(staff.restaurantId, token);
      } catch {
        alert('Unable to load restaurant details. Please refresh and try again.');
        return;
      }
    }

    if (!restaurantDetails) {
      alert('Unable to load restaurant details. Please refresh and try again.');
      return;
    }

    // Load bill payment image from localStorage
    const billImage = staff?.restaurantId ? localStorage.getItem(`billImage_${staff.restaurantId}`) : null;
    const billImageLabel = staff?.restaurantId ? (localStorage.getItem(`billImageLabel_${staff.restaurantId}`) || 'Scan to Pay') : 'Scan to Pay';

    const restaurantName = restaurantDetails.name || 'Restaurant';
    const restaurantAddress = restaurantDetails.address || '';
    const restaurantPhone = restaurantDetails.phone || '';
    const restaurantEmail = restaurantDetails.email || '';
    const taxPercentage = restaurantDetails.taxPercentage || 0;
    const serviceChargePercentage = restaurantDetails.serviceChargePercentage || 0;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    // Build items HTML
    const itemsHTML = order.items?.map((item: any) => `
      <div class="item">
        <div class="item-left">
          <div class="item-name">${item.menuItem?.name || 'Item'}</div>
          <div class="item-qty">x${item.quantity} @ ₹${item.price.toFixed(2)}</div>
        </div>
        <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('') || '';

    // Build tax row
    const taxRow = (order.taxAmount || 0) > 0 ? `
      <div class="summary-row">
        <span>Tax (${taxPercentage}%)</span>
        <span>₹${(order.taxAmount || 0).toFixed(2)}</span>
      </div>
    ` : '';

    // Build service charge row
    const serviceChargeRow = (order.serviceCharge || 0) > 0 ? `
      <div class="summary-row">
        <span>Service Charge (${serviceChargePercentage}%)</span>
        <span>₹${(order.serviceCharge || 0).toFixed(2)}</span>
      </div>
    ` : '';

    // Build discount row
    const discountRow = (order.discountAmount || 0) > 0 ? `
      <div class="summary-row">
        <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}</span>
        <span>-₹${(order.discountAmount || 0).toFixed(2)}</span>
      </div>
    ` : '';

    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill - ${order.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            padding: 4mm 4mm 8mm 4mm;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header { text-align: center; margin-bottom: 6px; }
          .header h1 { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
          .header p { font-size: 10px; margin: 1px 0; }
          .dashed { border-top: 1px dashed #000; margin: 5px 0; }
          .solid { border-top: 1px solid #000; margin: 5px 0; }
          .order-meta { font-size: 10px; margin: 4px 0; }
          .order-meta p { margin: 2px 0; }
          .items { margin: 4px 0; }
          .item { display: flex; justify-content: space-between; align-items: flex-start; margin: 3px 0; font-size: 11px; }
          .item-left { flex: 1; padding-right: 4px; }
          .item-name { font-weight: bold; }
          .item-qty { color: #444; font-size: 10px; }
          .item-price { white-space: nowrap; font-weight: bold; }
          .summary { margin: 4px 0; }
          .summary-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
          .summary-row.total { 
            font-weight: bold; 
            font-size: 13px; 
            margin-top: 4px; 
            padding-top: 3px;
            border-top: 1px solid #000;
          }
          .payment-badge {
            text-align: center;
            border: 2px solid #000;
            padding: 4px;
            margin: 6px 0;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .footer { text-align: center; margin-top: 6px; font-size: 10px; }
          .footer p { margin: 2px 0; }
          @media print {
            html, body { width: 80mm; }
            @page { 
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${restaurantName}</h1>
          ${restaurantAddress ? `<p>${restaurantAddress}</p>` : ''}
          ${restaurantPhone ? `<p>Tel: ${restaurantPhone}</p>` : ''}
          ${restaurantEmail ? `<p>${restaurantEmail}</p>` : ''}
        </div>

        <div class="dashed"></div>

        <div class="order-meta center">
          <p class="bold">ORDER #${order.orderNumber?.slice(-8)}</p>
          <p>Table ${order.table?.tableNumber} | ${order.table?.section || 'Main'}</p>
          <p>${new Date(order.createdAt).toLocaleString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}</p>
          ${order.guestName ? `<p>Guest: ${order.guestName}</p>` : ''}
        </div>

        <div class="dashed"></div>

        <div class="items">
          <div class="item bold" style="font-size:10px; color:#555; margin-bottom:3px;">
            <span class="item-left">ITEM</span>
            <span>AMT</span>
          </div>
          ${itemsHTML}
        </div>

        <div class="dashed"></div>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          ${taxRow}
          ${serviceChargeRow}
          ${discountRow}
          <div class="summary-row total">
            <span>TOTAL</span>
            <span>₹${(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="payment-badge">
          ${order.paymentStatus === 'completed' ? '*** PAID ***' : 'UNPAID — PAY AT COUNTER'}
        </div>

        <div class="dashed"></div>

        <div class="footer">
          <p>Thank you for dining with us!</p>
          <p>Please visit again</p>
          ${billImage ? `
          <div style="margin-top:8px;">
            <div class="dashed"></div>
            <p style="font-size:10px; font-weight:bold; margin-bottom:4px;">${billImageLabel}</p>
            <img src="${billImage}" style="width:48mm; height:48mm; object-fit:contain; display:block; margin:0 auto;" />
          </div>
          ` : ''}
          <p style="margin-top:4px; font-size:9px;">Powered by ForkAdmin</p>
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

    printWindow.document.write(billHTML);
    printWindow.document.close();
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
                      <div className="flex flex-wrap gap-1.5">
                        {order.items?.map((item: any) => {
                          const itemAge = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
                          const isNewItem = itemAge < 2 && !isNew; // New item in existing order
                          return (
                            <span key={item.id} className={`inline-flex items-center gap-1 ${isNewItem ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-600'} border text-xs px-2.5 py-1 rounded-lg font-medium`}>
                              {isNewItem && <span className="text-blue-500">🆕</span>}
                              <span className="text-gray-400">×{item.quantity}</span> {item.menuItem?.name}
                            </span>
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
                        <button onClick={() => printBill(order)}
                          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1">
                          🖨️ Bill
                        </button>
                        {order.status === 'completed' && order.paymentStatus !== 'completed' && (
                          <button
                            onClick={() => markPaid(order.id)}
                            disabled={updating === order.id}
                            className="text-xs font-semibold px-3 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50"
                          >
                            💰 Mark Paid
                          </button>
                        )}
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white cursor-pointer focus:outline-none focus:border-orange-400 transition-all disabled:opacity-50 ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="text-gray-700">
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        {updating === order.id && (
                          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
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
