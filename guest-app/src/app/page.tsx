'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setLoading(true);
      router.push(`/menu?table=${table}`);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="text-6xl mb-6">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
        <p className="text-gray-500 mb-8">Scan the QR code on your table to view the menu and place your order.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        <div className="card p-6 text-left">
          <p className="text-sm text-gray-500 mb-3">Or enter your table QR code manually:</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = (e.currentTarget.elements.namedItem('code') as HTMLInputElement).value.trim();
              if (!code) { setError('Please enter a QR code'); return; }
              router.push(`/menu?table=${code}`);
            }}
          >
            <input
              name="code"
              type="text"
              placeholder="Enter table code"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button type="submit" className="btn-primary w-full">Go to Menu</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
