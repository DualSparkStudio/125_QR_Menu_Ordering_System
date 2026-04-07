'use client';

import { useState, useEffect } from 'react';
import { useOrdersStore, Order } from '@/store/ordersStore';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pista-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Track and manage all room service orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-pista-900">{orders.length}</p>
        </div>
        <div className="glass-effect border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="glass-effect border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Preparing</p>
          <p className="text-2xl font-bold text-blue-700">{orders.filter(o => o.status === 'preparing').length}</p>
        </div>
        <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Ready</p>
          <p className="text-2xl font-bold text-green-700">{orders.filter(o => o.status === 'ready').length}</p>
        </div>
        <div className="glass-effect border-2 border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Delivered</p>
          <p className="text-2xl font-bold text-gray-700">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'preparing', 'ready', 'delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-pista-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="glass-effect border-2 border-pista-200 rounded-xl p-5 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-pista-900">Room {order.roomId}</h3>
                <p className="text-xs text-gray-500 font-mono">{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.timestamp).toLocaleTimeString()} - {new Date(order.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-pista-700">₹{order.total}</p>
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border-2 mt-1 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-pista-600 font-semibold uppercase mb-2">Items Ordered ({order.items.length})</p>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between bg-pista-50 p-2 rounded-lg border border-pista-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-pista-500 rounded-full"></span>
                      <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                    </div>
                    <span className="text-sm font-bold text-pista-700">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {order.notes && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700 font-semibold mb-1">Notes:</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-pista-600 font-semibold uppercase mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(['pending', 'preparing', 'ready', 'delivered'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(order.id, status)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                      order.status === status
                        ? 'bg-pista-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 glass-effect border-2 border-pista-200 rounded-xl">
          <span className="text-6xl block mb-4">📦</span>
          <p className="text-gray-500 text-lg font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here when guests place them</p>
        </div>
      )}
    </div>
  );
}
