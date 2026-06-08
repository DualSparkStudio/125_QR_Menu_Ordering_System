'use client';

import { useEffect, useRef } from 'react';
import { createStyledQr } from '@/lib/styledQr';

interface StyledQrCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export default function StyledQrCode({ data, size = 200, className }: StyledQrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data) return;

    let cancelled = false;
    container.innerHTML = '';

    createStyledQr(data, size).then((qr) => {
      if (cancelled) return;
      qr.append(container);
      const canvas = container.querySelector('canvas');
      if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
      }
    });

    return () => {
      cancelled = true;
      container.innerHTML = '';
    };
  }, [data, size]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-full ${className ?? ''}`}
      style={{ width: size, height: size, maxWidth: '100%', aspectRatio: '1' }}
    />
  );
}
