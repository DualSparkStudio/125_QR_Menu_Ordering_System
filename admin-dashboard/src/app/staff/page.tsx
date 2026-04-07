'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const ROLES = ['owner', 'manager', 'chef', 'waiter', 'cashier'];
const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  chef: 'bg-orange-100 text-orange-700',
  waiter: 'bg-teal-100 text-teal-700',
  cashier: 'bg-green-100 text-green-700',
};

export default function StaffPage() {
  const { staff: me, token } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'waiter', password: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!me?.restaurantId || !token) return;
    const data: any = await adminApi.getStaff(me.restaurantId, token);
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [me, token]);

  const createStaff = async () => {
    if (!me?.restaurantId || !token || !form.name || !form.email || !form.password) return;
    setSaving(true);
    try {
      await adminApi.createStaff(me.restaurantId, form, token);
      setForm({ name: '', email: '', phone: '', role: 'waiter', password: '' });
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!me?.restaurantId || !token) return;
    await adminApi.updateStaff(me.restaurantId, id, { isActive: !isActive }, token);
    await load();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-orange-600 text-sm">+ Add Staff</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
                  {member.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{member.name}</span>
                    <span className={`badge ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-600'}`}>{member.role}</span>
                    {!member.isActive && <span className="badge bg-red-100 text-red-600">Inactive</span>}
                  </div>
                  <p className="text-sm text-gray-500">{member.email} · {member.phone}</p>
                  {member.lastLoginAt && <p className="text-xs text-gray-400">Last login: {new Date(member.lastLoginAt).toLocaleDateString()}</p>}
                </div>
                <button
                  onClick={() => toggleActive(member.id, member.isActive)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${member.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {member.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Add Staff Member</h2>
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password *" type="password" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={createStaff} disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
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
