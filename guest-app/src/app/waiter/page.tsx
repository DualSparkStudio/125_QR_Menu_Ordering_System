'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import Link from 'next/link';

const CALL_TYPES = [
  { type: 'waiter', label: 'Call Waiter', icon: '🙋', desc: 'Need assistance' },
  { type: 'bill', label: 'Request Bill', icon: '🧾', desc: 'Ready to pay' },
  { type: 'water', label: 'Water Please', icon: '💧', desc: 'Need water' },
  { type: 'napkins', label: 'Napkins', icon: '🧻', desc: 'Need napkins' },
  { type: 'other', label: 'Other', icon: '💬', desc: 'Something else' },
];

export default function WaiterPage() {
  const { tableId, restaurantId } = useCartStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCall = async () => {
    if (!selected || !tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.callWaiter(restaurantId, tableId, { type: selected, note: note || undefined });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
        <p className="text-gray-500 mb-8 text-center">A staff member will be with you shortly.</p>
        <Link href="/menu" className="btn-primary">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3">
          <Link href="/menu" className="text-gray-500">←</Link>
          <h1 className="font-bold text-xl text-gray-900">Call for Assistance</h1>
        </div>

        <div className="px-4 pt-6 space-y-3">
          <p className="text-gray-500 text-sm mb-4">What do you need?</p>

          {CALL_TYPES.map((ct) => (
            <button
              key={ct.type}
              onClick={() => setSelected(ct.type)}
              className={`w-full card p-4 flex items-center gap-4 text-left transition-all ${selected === ct.type ? 'border-2 border-orange-500 bg-orange-50' : ''}`}
            >
              <span className="text-3xl">{ct.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{ct.label}</p>
                <p className="text-sm text-gray-500">{ct.desc}</p>
              </div>
              {selected === ct.type && <span className="ml-auto text-orange-500 font-bold">✓</span>}
            </button>
          ))}

          {selected === 'other' && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what you need..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

          <button
            onClick={handleCall}
            disabled={!selected || loading}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Sending...' : 'Send Request 🔔'}
          </button>
        </div>
      </div>
    </div>
  );
}
