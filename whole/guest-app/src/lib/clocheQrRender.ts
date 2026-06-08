import { drawClocheClip, drawClocheDecor } from './qrClocheShape';
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

/**
 * Renders a dense QR clipped to a filled cloche silhouette.
 */
export async function renderClocheQrCanvas(
  qrUrl: string,
  width: number,
): Promise<HTMLCanvasElement> {
  const height = Math.round(width * 1.15);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const cx = width / 2;
  const cy = height * 0.38;
  const unit = width / 200;

  // Soft plate glow
  const glow = ctx.createRadialGradient(cx, cy + 52 * unit, 0, cx, cy + 52 * unit, 100 * unit);
  glow.addColorStop(0, 'rgba(255,255,255,0.95)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const qrDataUrl = await getTentQrDataUrl(qrUrl, Math.round(width * 1.05));
  const qrImg = await loadImage(qrDataUrl);

  const qrSize = width * 0.92;
  const qrX = cx - qrSize / 2;
  const qrY = cy - qrSize * 0.48;

  // White fill inside cloche before QR
  ctx.save();
  drawClocheClip(ctx, cx, cy, unit);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  ctx.restore();

  drawClocheDecor(ctx, cx, cy, unit);

  return canvas;
}

export async function getClocheQrDataUrl(qrUrl: string, width: number): Promise<string> {
  const canvas = await renderClocheQrCanvas(qrUrl, width);
  return canvas.toDataURL('image/png');
}
