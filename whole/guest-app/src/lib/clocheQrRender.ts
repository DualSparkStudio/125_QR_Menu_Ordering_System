import { drawClocheDecorAroundQr } from './qrClocheShape';
import { getTentQrDataUrl } from './styledQr';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Full scannable square QR + cloche frame drawn on top (shape unchanged, scan-safe).
 */
export async function renderClocheQrCanvas(
  qrUrl: string,
  width: number,
): Promise<HTMLCanvasElement> {
  const height = Math.round(width * 1.18);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const cx = width / 2;
  const qrSize = width * 0.68;
  const qrX = cx - qrSize / 2;
  const qrY = height * 0.16;
  const pad = width * 0.04;

  // High-res QR (2×) for sharp print + reliable scan
  const qrDataUrl = await getTentQrDataUrl(qrUrl, Math.round(qrSize * 3));
  const qrImg = await loadImage(qrDataUrl);

  // White card with quiet zone padding around QR
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, pad * 0.8);
  ctx.fill();

  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = width * 0.02;
  ctx.shadowOffsetY = width * 0.008;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Cloche frame around the card — strokes stay outside QR modules
  drawClocheDecorAroundQr(ctx, qrX, qrY, qrSize, pad);

  return canvas;
}

export async function getClocheQrDataUrl(qrUrl: string, width: number): Promise<string> {
  const canvas = await renderClocheQrCanvas(qrUrl, width);
  return canvas.toDataURL('image/png');
}
