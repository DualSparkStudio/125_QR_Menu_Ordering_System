'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-red-100 text-red-700',
  reserved: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-gray-100 text-gray-600',
};

export default function TablesPage() {
  const { staff, token } = useAuthStore();
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', section: 'main', capacity: '4' });
  const [saving, setSaving] = useState(false);
  const [qrModal, setQrModal] = useState<any>(null);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    const data: any = await adminApi.getTables(staff.restaurantId, token);
    setTables(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [staff, token]);

  const createTable = async () => {
    if (!staff?.restaurantId || !token || !form.tableNumber) return;
    setSaving(true);
    try {
      await adminApi.createTable(staff.restaurantId, { ...form, capacity: parseInt(form.capacity) }, token);
      setForm({ tableNumber: '', section: 'main', capacity: '4' });
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!staff?.restaurantId || !token) return;
    await adminApi.updateTableStatus(staff.restaurantId, id, status, token);
    await load();
  };

  const deleteTable = async (id: string) => {
    if (!staff?.restaurantId || !token || !confirm('Delete this table?')) return;
    await adminApi.deleteTable(staff.restaurantId, id, token);
    await load();
  };

  const regenerateQR = async (id: string) => {
    if (!staff?.restaurantId || !token) return;
    const updated: any = await adminApi.regenerateQR(staff.restaurantId, id, token);
    setQrModal(updated);
    await load();
  };

  const sections = [...new Set(tables.map((t) => t.section))];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
          <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-orange-600 text-sm">+ Add Table</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : (
          sections.map((section) => (
            <div key={section} className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">{section} Section</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.filter((t) => t.section === section).map((table) => (
                  <div key={table.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">T{table.tableNumber}</p>
                        <p className="text-xs text-gray-400">{table.capacity} seats</p>
                      </div>
                      <span className={`badge ${STATUS_COLORS[table.status]}`}>{table.status}</span>
                    </div>

                    <select
                      value={table.status}
                      onChange={(e) => updateStatus(table.id, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>

                    <div className="flex gap-1">
                      <button onClick={() => setQrModal(table)} className="flex-1 text-xs bg-blue-50 text-blue-600 py-1.5 rounded-lg hover:bg-blue-100 font-medium">QR</button>
                      <button onClick={() => regenerateQR(table.id)} className="flex-1 text-xs bg-gray-50 text-gray-600 py-1.5 rounded-lg hover:bg-gray-100 font-medium">↻ QR</button>
                      <button onClick={() => deleteTable(table.id)} className="text-xs bg-red-50 text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-100 font-medium">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Add table modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Add Table</h2>
              <div className="space-y-3">
                <input value={form.tableNumber} onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))} placeholder="Table number *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <select value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="main">Main</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="bar">Bar</option>
                  <option value="private">Private</option>
                </select>
                <input value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Capacity" type="number" min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={createTable} disabled={saving} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR modal */}
        {qrModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
              <h2 className="font-bold text-lg text-gray-900 mb-1">Table {qrModal.tableNumber} QR Code</h2>
              <p className="text-sm text-gray-500 mb-4">Print and place on the table</p>
              {qrModal.qrCodeUrl && <img src={qrModal.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-4 rounded-xl" />}
              <p className="text-xs text-gray-400 mb-4 break-all">{qrModal.qrCode}</p>
              <button onClick={() => setQrModal(null)} className="w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600">Close</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
