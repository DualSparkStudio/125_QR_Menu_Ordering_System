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
    try { const data: any = await adminApi.getSalesReport(staff.restaurantId, token, startDate, endDate); setReport(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [staff, token]);

  const maxRevenue = report?.daily?.length ? Math.max(...report.daily.map((d: any) => d.revenue)) : 1;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-gray-900">Reports</h1>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input text-xs py-2 w-36" />
            <span className="text-gray-300">→</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input text-xs py-2 w-36" />
            <button onClick={load} className="btn-primary text-xs px-4 py-2">Generate</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
        ) : report ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: `₹${report.totalRevenue.toFixed(0)}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Orders', value: report.totalOrders, icon: '📋', color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Avg Order Value', value: `₹${report.avgOrderValue.toFixed(0)}`, icon: '📊', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((s) => (
                <div key={s.label} className="card p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Top items */}
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 mb-4">Top Selling Items</h2>
                {report.topItems.length === 0 ? (
                  <p className="text-gray-300 text-sm text-center py-8">No data</p>
                ) : (
                  <div className="space-y-3">
                    {report.topItems.slice(0, 8).map((item: any, i: number) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-300 w-4 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{item.count}× · ₹{item.revenue.toFixed(0)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${(item.count / report.topItems[0].count) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily revenue chart */}
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 mb-4">Daily Revenue</h2>
                {report.daily.length === 0 ? (
                  <p className="text-gray-300 text-sm text-center py-8">No data</p>
                ) : (
                  <>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-1 h-24 mb-3">
                      {report.daily.slice(-14).map((day: any) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ₹{day.revenue.toFixed(0)}
                          </div>
                          <div className="w-full bg-orange-500 rounded-t-sm transition-all hover:bg-orange-400"
                            style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {report.daily.slice(-7).reverse().map((day: any) => (
                        <div key={day.date} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-500 text-xs">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-gray-400 text-xs">{day.orders} orders</span>
                          <span className="font-bold text-gray-900 text-xs">₹{day.revenue.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
