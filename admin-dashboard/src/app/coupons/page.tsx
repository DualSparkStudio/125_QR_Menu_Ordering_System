'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function CouponsPage() {
  const { staff, token } = useAuthStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', expiresAt: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    const data: any = await adminApi.getCoupons(staff.restaurantId, token);
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [staff, token]);

  const createCoupon = async () => {
    if (!staff?.restaurantId || !token || !form.code || !form.discountValue) return;
    setSaving(true);
    try {
      await adminApi.createCoupon(staff.restaurantId, {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      }, token);
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', expiresAt: '' });
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  };

  const toggle = async (id: string) => {
    if (!staff?.restaurantId || !token) return;
    await adminApi.toggleCoupon(staff.restaurantId, id, token);
    await load();
  };

  const deleteCoupon = async (id: string) => {
    if (!staff?.restaurantId || !token || !confirm('Delete this coupon?')) return;
    await adminApi.deleteCoupon(staff.restaurantId, id, token);
    await load();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-orange-600 text-sm">+ Create Coupon</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-2">🎟️</div><p>No coupons yet</p></div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 font-mono">{coupon.code}</span>
                    <span className={`badge ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                    {coupon.minOrderValue > 0 && ` · Min order ₹${coupon.minOrderValue}`}
                    {coupon.usageLimit && ` · ${coupon.usedCount}/${coupon.usageLimit} used`}
                    {coupon.expiresAt && ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(coupon.id)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${coupon.isActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {coupon.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Create Coupon</h2>
              <div className="space-y-3">
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Coupon code (e.g. SAVE20) *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed ₹</option>
                  </select>
                  <input value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} placeholder="Value *" type="number" min="0" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} placeholder="Min order ₹" type="number" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <input value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} placeholder="Max discount ₹" type="number" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} placeholder="Usage limit" type="number" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <input value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} type="date" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={createCoupon} disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
