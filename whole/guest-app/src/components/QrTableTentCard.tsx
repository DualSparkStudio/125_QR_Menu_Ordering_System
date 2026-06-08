'use client';

import { useEffect, useState } from 'react';
import ClocheQrImage from '@/components/ClocheQrImage';
import { getTableQrUrl } from '@/lib/styledQr';

interface QrTableTentCardProps {
  restaurantName: string;
  logoUrl?: string | null;
  tableNumber: string | number;
  section?: string;
  qrCode: string;
  compact?: boolean;
}

export default function QrTableTentCard({
  restaurantName,
  logoUrl,
  tableNumber,
  section,
  qrCode,
  compact = false,
}: QrTableTentCardProps) {
  const [logoError, setLogoError] = useState(false);
  const qrUrl = getTableQrUrl(qrCode);
  const clocheW = compact ? 118 : 200;

  useEffect(() => { setLogoError(false); }, [logoUrl]);

  return (
    <div
      className={`flex flex-col overflow-hidden shadow-lg ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
      style={{ aspectRatio: '2/3' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0 px-3"
        style={{
          minHeight: compact ? 38 : 54,
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D0 100%)',
        }}
      >
        {logoUrl && !logoError ? (
          <img
            src={logoUrl}
            alt=""
            onError={() => setLogoError(true)}
            className={`object-contain ${compact ? 'h-7 max-w-[72px]' : 'h-10 max-w-[110px]'}`}
          />
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={compact ? 'text-base' : 'text-xl'}>🍽️</span>
            <div className="min-w-0">
              <p className={`font-bold text-[#3D2314] truncate ${compact ? 'text-[7px] max-w-[60px]' : 'text-[10px] max-w-[90px]'}`}>
                {restaurantName}
              </p>
              <p className={`text-[#9A6B4A] font-semibold ${compact ? 'text-[6px]' : 'text-[8px]'}`}>Welcome!</p>
            </div>
          </div>
        )}

        <div
          className={`text-white text-center shrink-0 shadow-sm ${
            compact ? 'px-2 py-1 rounded-lg min-w-[52px]' : 'px-3 py-1.5 rounded-xl min-w-[68px]'
          }`}
          style={{ background: 'linear-gradient(135deg, #FF6B35, #E85D04)' }}
        >
          <p className={`font-bold uppercase tracking-wider ${compact ? 'text-[5px]' : 'text-[7px]'}`}>Your Table</p>
          <p className={`font-black leading-none ${compact ? 'text-sm' : 'text-xl'}`}>
            {String(tableNumber).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Body */}
      <div
        className="flex-1 flex flex-col items-center relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFB703 0%, #FFC93C 45%, #FF9500 100%)' }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
            backgroundSize: compact ? '14px 14px' : '20px 20px',
          }}
        />

        {/* Sparkles */}
        <span className={`absolute text-white/70 ${compact ? 'text-[8px] top-2 left-3' : 'text-xs top-3 left-4'}`}>✦</span>
        <span className={`absolute text-white/70 ${compact ? 'text-[8px] top-4 right-3' : 'text-xs top-5 right-4'}`}>✦</span>

        <div className={`relative z-10 text-center ${compact ? 'pt-2 px-2' : 'pt-4 px-3'}`}>
          <p
            className={`font-black text-white leading-tight drop-shadow-md ${
              compact ? 'text-[9px]' : 'text-sm'
            }`}
          >
            Order with a Smile!
          </p>
          <p className={`text-white/90 font-semibold ${compact ? 'text-[5px] mt-0.5' : 'text-[8px] mt-1'}`}>
            Scan below — good food awaits ✨
          </p>
        </div>

        {/* Food accents */}
        <span className={`absolute z-10 ${compact ? 'text-xs left-2 top-[42%]' : 'text-lg left-4 top-[44%]'}`}>🍕</span>
        <span className={`absolute z-10 ${compact ? 'text-xs right-2 top-[38%]' : 'text-lg right-4 top-[40%]'}`}>🍔</span>
        <span className={`absolute z-10 ${compact ? 'text-xs right-2 bottom-[28%]' : 'text-lg right-4 bottom-[30%]'}`}>😋</span>
        <span className={`absolute z-10 ${compact ? 'text-xs left-2 bottom-[22%]' : 'text-lg left-4 bottom-[24%]'}`}>☕</span>

        {/* Filled cloche QR */}
        <div className={`relative z-10 flex-1 flex items-center justify-center ${compact ? 'pb-1' : 'pb-2'}`}>
          <ClocheQrImage qrUrl={qrUrl} width={clocheW} className="drop-shadow-lg" />
        </div>
      </div>

      {/* Footer */}
      <div
        className={`text-center shrink-0 relative ${compact ? 'px-2 py-2' : 'px-3 py-3'}`}
        style={{ background: 'linear-gradient(180deg, #2D1810, #1A0F0A)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
        <p className={`font-bold text-white ${compact ? 'text-[5px]' : 'text-[8px]'}`}>
          📱 Scan to Browse Our Menu
        </p>
        <p className={`text-white/70 font-semibold ${compact ? 'text-[4px] mt-0.5' : 'text-[7px] mt-1'}`}>
          Special Offers · Chef&apos;s Picks · Easy Ordering
        </p>
        {section && (
          <p className={`text-[#FFB703] font-bold uppercase ${compact ? 'text-[4px] mt-1' : 'text-[6px] mt-1.5'}`}>
            ✦ {section} seating ✦
          </p>
        )}
      </div>
    </div>
  );
}
