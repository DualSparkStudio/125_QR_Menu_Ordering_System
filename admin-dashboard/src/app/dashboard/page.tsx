'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function DashboardPage() {
  const { staff, token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staff?.restaurantId || !token) return;
    adminApi.getDashboard(staff.restaurantId, token)
      .then((data: any) => setStats(data))
      .finally(() => setLoading(false));
  }, [staff, token]);

  const STAT_CARDS = stats ? [
    { label: 'Tables Occupied', value: `${stats.tables.occupied}/${stats.tables.total}`, sub: `${stats.tables.available} available`, icon: '🪑', color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Orders", value: stats.orders.today, sub: `${stats.orders.pending} pending`, icon: '📋', color: 'bg-orange-50 text-orange-600' },
    { label: "Today's Revenue", value: `₹${stats.revenue.today.toFixed(0)}`, sub: `Total: ₹${stats.revenue.total.toFixed(0)}`, icon: '💰', color: 'bg-green-50 text-green-600' },
    { label: 'Waiter Calls', value: stats.waiterCalls.pending, sub: 'Pending requests', icon: '🔔', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Food Rating', value: `${stats.ratings.food}/5`, sub: `Service: ${stats.ratings.service}/5`, icon: '⭐', color: 'bg-purple-50 text-purple-600' },
  ] : [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {staff?.name}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="stat-card h-28 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/orders', label: 'View Orders', icon: '📋' },
              { href: '/tables', label: 'Manage Tables', icon: '🪑' },
              { href: '/menu', label: 'Edit Menu', icon: '🍽️' },
              { href: '/reports', label: 'View Reports', icon: '📈' },
            ].map((action) => (
              <a key={action.href} href={action.href} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-orange-200 hover:bg-orange-50 transition-all">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
