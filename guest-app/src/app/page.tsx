'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tableInput, setTableInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setLoading(true);
      router.push(`/menu?table=${table}`);
    }
  }, [searchParams, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = tableInput.trim();
    if (!code) { setError('Please enter your table number'); return; }
    setLoading(true);
    router.push(`/menu?table=${code}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center slide-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-orange-500/10 flex items-center justify-center text-2xl">🍽️</div>
          </div>
          <p className="text-white/70 text-lg font-medium">Loading your menu...</p>
          <p className="text-white/30 text-sm mt-1">Just a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg flex flex-col overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-10 slide-up">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-5xl shadow-2xl glow-orange">
              🍽️
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full pulse-dot" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Scan & <span className="gradient-text">Order</span>
          </h1>
          <p className="text-white/50 text-base max-w-xs mx-auto leading-relaxed">
            Scan the QR code on your table or enter your table number to start ordering
          </p>
        </div>

        {/* QR Scanner Card */}
        <div className="w-full max-w-sm slide-up" style={{ animationDelay: '0.1s' }}>
          {!scanning ? (
            <div className="glass rounded-3xl p-6 mb-4">
              {/* QR Scan button */}
              <button
                onClick={() => setScanning(true)}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-px mb-4 group"
              >
                <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
                  <div className="relative">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg">Scan QR Code</span>
                </div>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Manual entry */}
              <form onSubmit={handleSubmit}>
                <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">Table Number</label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    value={tableInput}
                    onChange={(e) => { setTableInput(e.target.value); setError(''); }}
                    placeholder="e.g. 1, 2, 3..."
                    className="input-dark text-center text-2xl font-bold tracking-widest h-16"
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={!tableInput.trim()}
                  className="w-full mt-4 bg-white text-gray-900 font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50"
                >
                  Go to Menu →
                </button>
              </form>
            </div>
          ) : (
            <QRScannerView
              onResult={(code) => { setScanning(false); router.push(`/menu?table=${code}`); }}
              onClose={() => setScanning(false)}
            />
          )}
        </div>

        {/* Features */}
        <div className="flex gap-6 mt-8 slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '⚡', label: 'Instant Order' },
            { icon: '🔒', label: 'Secure Pay' },
            { icon: '📍', label: 'Table Service' },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-white/30 text-xs font-medium">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QRScannerView({ onResult, onClose }: { onResult: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Try to use BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const raw = barcodes[0].rawValue as string;
                  // Extract table param from URL or use raw value
                  const match = raw.match(/[?&]table=([^&]+)/);
                  onResult(match ? match[1] : raw);
                }
              } catch {}
            }
          }, 500);
        }
      } catch {
        setError('Camera access denied. Please enter table number manually.');
      }
    };

    startCamera();
    return () => {
      clearInterval(interval);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="glass rounded-3xl overflow-hidden bounce-in">
      <div className="relative">
        <video ref={videoRef} className="w-full aspect-square object-cover" playsInline muted />
        {/* Scanner overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-52 h-52">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
            {/* Scan line */}
            <div className="absolute left-2 right-2 h-0.5 bg-orange-500/70 top-1/2 animate-pulse" />
          </div>
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white text-lg">✕</button>
      </div>
      <div className="p-4">
        {error ? (
          <p className="text-red-400 text-sm text-center mb-3">{error}</p>
        ) : (
          <p className="text-white/50 text-sm text-center mb-3">Point camera at the QR code on your table</p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); if (manualCode.trim()) onResult(manualCode.trim()); }}>
          <div className="flex gap-2">
            <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Or type table number" className="input-dark flex-1 py-2.5 text-sm" />
            <button type="submit" className="bg-orange-500 text-white px-4 rounded-xl font-semibold text-sm">Go</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
