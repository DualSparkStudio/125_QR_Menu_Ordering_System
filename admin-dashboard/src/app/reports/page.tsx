'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function ReportsPage() {
  const { staff, token } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    setLoading(true);
    try {
      const data: any = await adminApi.getSalesReport(staff.restaurantId, token, startDate, endDate);
      setReport(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [staff, token]);

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

        {/* Date range */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button onClick={load} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">Generate</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="stat-card h-28 animate-pulse bg-gray-100" />)}</div>
        ) : report ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{report.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{report.totalOrders}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-500 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900">₹{report.avgOrderValue.toFixed(0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top items */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Top Selling Items</h2>
                <div className="space-y-3">
                  {report.topItems.slice(0, 8).map((item: any, i: number) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.count} orders · ₹{item.revenue.toFixed(0)}</p>
                      </div>
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(item.count / report.topItems[0].count) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {report.daily.slice(-14).reverse().map((day: any) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-gray-400">{day.orders} orders</span>
                      <span className="font-semibold text-gray-900">₹{day.revenue.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
