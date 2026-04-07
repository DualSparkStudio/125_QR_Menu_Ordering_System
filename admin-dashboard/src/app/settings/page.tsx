'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const { staff, token } = useAuthStore();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!staff?.restaurantId || !token) return;
    adminApi.getRestaurant(staff.restaurantId, token).then((data: any) => {
      setRestaurant(data);
      setForm({ name: data.name, description: data.description || '', phone: data.phone, email: data.email, address: data.address, taxPercentage: data.taxPercentage, serviceChargePercentage: data.serviceChargePercentage, isOpen: data.isOpen });
    });
  }, [staff, token]);

  const save = async () => {
    if (!staff?.restaurantId || !token) return;
    setSaving(true);
    try {
      await adminApi.updateRestaurant(staff.restaurantId, form, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (!restaurant) return <AdminLayout><div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-4" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Settings</h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input value={form.name || ''} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone || ''} onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email || ''} onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))} type="email" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address || ''} onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
              <input value={form.taxPercentage || 0} onChange={(e) => setForm((f: any) => ({ ...f, taxPercentage: parseFloat(e.target.value) }))} type="number" min="0" max="100" step="0.5" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label>
              <input value={form.serviceChargePercentage || 0} onChange={(e) => setForm((f: any) => ({ ...f, serviceChargePercentage: parseFloat(e.target.value) }))} type="number" min="0" max="100" step="0.5" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isOpen || false} onChange={(e) => setForm((f: any) => ({ ...f, isOpen: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Restaurant is {form.isOpen ? 'Open' : 'Closed'}</span>
          </div>

          {saved && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">✓ Settings saved successfully</div>}

          <button onClick={save} disabled={saving} className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
