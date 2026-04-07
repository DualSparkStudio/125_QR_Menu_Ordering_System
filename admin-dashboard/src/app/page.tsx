'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); router.push('/dashboard'); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] p-12 bg-gradient-to-br from-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
            <span className="text-white font-bold text-lg">ForkAdmin</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Manage your restaurant smarter
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Real-time orders, menu management, table tracking and analytics — all in one place.
          </p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: '⚡', text: 'Live order tracking & KDS' },
            { icon: '📊', text: 'Revenue analytics & reports' },
            { icon: '🪑', text: 'Table & QR code management' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-white/80">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
            <span className="text-white font-bold text-lg">ForkAdmin</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
          <p className="text-white/40 mb-8">Sign in to your restaurant dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="admin@restaurant.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 transition-all text-sm pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></> : 'Sign In →'}
            </button>
          </form>

          <p className="text-white/20 text-xs text-center mt-8">
            Default: admin@thefork.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
