'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import Link from 'next/link';

const CALLS = [
  { type: 'waiter',  icon: '🙋', label: 'Call Waiter',    desc: 'Need assistance at your table', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  { type: 'bill',    icon: '🧾', label: 'Request Bill',   desc: 'Ready to pay and leave',         color: 'from-green-500/20 to-green-600/10 border-green-500/20' },
  { type: 'water',   icon: '💧', label: 'Water Please',   desc: 'Need water refill',              color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20' },
  { type: 'napkins', icon: '🧻', label: 'Napkins',        desc: 'Need extra napkins',             color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20' },
  { type: 'other',   icon: '💬', label: 'Other Request',  desc: 'Something else',                 color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20' },
];

export default function WaiterPage() {
  const { tableId, restaurantId } = useCartStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!selected || !tableId || !restaurantId) { setError('Session expired. Please scan QR again.'); return; }
    setLoading(true);
    try {
      await api.callWaiter(restaurantId, tableId, { type: selected, note: note || undefined });
      setSuccess(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-6">
        <div className="glass rounded-3xl p-10 max-w-sm w-full text-center bounce-in">
          <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 border border-green-500/20">✅</div>
          <h2 className="text-2xl font-black text-white mb-2">Request Sent!</h2>
          <p className="text-white/40 mb-8">A staff member will be with you shortly.</p>
          <Link href="/menu" className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl text-center">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/menu" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-black text-white text-xl">Need Something?</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-3">
        <p className="text-white/30 text-sm mb-2">Select what you need and we'll send someone right away</p>

        {CALLS.map((c) => (
          <button
            key={c.type}
            onClick={() => setSelected(c.type)}
            className={`w-full bg-gradient-to-r ${c.color} border rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-98 ${selected === c.type ? 'ring-2 ring-orange-500/50 scale-[1.01]' : ''}`}
          >
            <div className="w-12 h-12 bg-white/8 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">{c.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-white">{c.label}</p>
              <p className="text-white/40 text-sm">{c.desc}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === c.type ? 'border-orange-500 bg-orange-500' : 'border-white/20'}`}>
              {selected === c.type && <span className="text-white text-xs font-black">✓</span>}
            </div>
          </button>
        ))}

        {selected === 'other' && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what you need..."
            rows={3}
            className="input-dark text-sm resize-none slide-up"
          />
        )}

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm">{error}</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pt-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={send}
            disabled={!selected || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-2xl text-lg shadow-2xl shadow-orange-500/30 transition-all active:scale-98 disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <span>🔔</span>}
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
