'use client';

import { useEffect, useState } from 'react';
import { getClocheQrDataUrl } from '@/lib/clocheQrRender';

interface ClocheQrImageProps {
  qrUrl: string;
  width: number;
  className?: string;
}

export default function ClocheQrImage({ qrUrl, width, className }: ClocheQrImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    getClocheQrDataUrl(qrUrl, width).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [qrUrl, width]);

  if (!src) {
    return (
      <div
        className={`animate-pulse bg-white/40 rounded-2xl ${className ?? ''}`}
        style={{ width, height: width * 1.15 }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Scan for menu"
      className={className}
      style={{ width, height: 'auto' }}
      draggable={false}
    />
  );
}
