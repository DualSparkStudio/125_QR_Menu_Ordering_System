/** Shared cloche silhouette geometry for QR clipping & decoration */

export const CLOCHE_VIEW_W = 200;
export const CLOCHE_VIEW_H = 230;

/** Filled cloche interior — QR modules fill this entire shape */
export const CLOCHE_CLIP_PATH =
  'M 28 128 A 72 72 0 0 1 172 128 L 176 148 Q 100 168 24 148 Z';

export const CLOCHE_OUTLINE_PATH =
  'M 28 128 A 72 72 0 0 1 172 128';

export function drawClocheClip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
) {
  const s = scale;
  ctx.beginPath();
  ctx.moveTo(cx - 72 * s, cy + 28 * s);
  ctx.arc(cx, cy + 28 * s, 72 * s, Math.PI, 0, false);
  ctx.lineTo(cx + 76 * s, cy + 48 * s);
  ctx.quadraticCurveTo(cx, cy + 68 * s, cx - 76 * s, cy + 48 * s);
  ctx.closePath();
}

export function drawClocheDecor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  stroke = '#1a1a1a',
) {
  const s = scale;
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.fillStyle = stroke;
  ctx.lineWidth = 3.5 * s;
  ctx.lineCap = 'round';

  // Dome highlight stroke
  ctx.beginPath();
  ctx.arc(cx, cy + 28 * s, 72 * s, Math.PI, 0, false);
  ctx.stroke();

  // Knob
  ctx.beginPath();
  ctx.arc(cx, cy - 52 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.beginPath();
  ctx.moveTo(cx, cy - 42 * s);
  ctx.lineTo(cx, cy - 38 * s);
  ctx.stroke();

  // Serving plate
  ctx.beginPath();
  ctx.ellipse(cx, cy + 52 * s, 92 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Plate rim
  ctx.beginPath();
  ctx.ellipse(cx, cy + 52 * s, 102 * s, 18 * s, 0, 0, Math.PI);
  ctx.stroke();

  // Steam wisps
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2 * s;
  for (const off of [-18, 0, 18]) {
    ctx.beginPath();
    ctx.moveTo(cx + off * s, cy - 58 * s);
    ctx.bezierCurveTo(
      cx + (off - 6) * s, cy - 72 * s,
      cx + (off + 6) * s, cy - 82 * s,
      cx + off * s, cy - 92 * s,
    );
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.35);
  ctx.lineCap = 'round';
  for (let a = 0; a < 4; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(angle) * r, y - Math.sin(angle) * r);
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    ctx.stroke();
  }
  ctx.restore();
}
