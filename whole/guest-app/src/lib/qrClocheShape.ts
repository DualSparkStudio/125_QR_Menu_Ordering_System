/** Cloche decorative frame drawn AROUND a scannable square QR (never clips QR data) */

export const CLOCHE_VIEW_W = 200;
export const CLOCHE_VIEW_H = 230;

/** Dome + plate outline framing a square QR — stroke only, for SVG preview */
export const CLOCHE_FRAME_SVG = `
  <path d="M 24 118 A 76 76 0 0 1 176 118" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="38" r="9" fill="#1a1a1a"/>
  <line x1="100" y1="47" x2="100" y2="42" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="100" cy="132" rx="94" ry="13" stroke="#1a1a1a" stroke-width="3" fill="none"/>
  <path d="M 12 132 A 88 15 0 0 0 188 132" stroke="#1a1a1a" stroke-width="3" fill="none"/>
`;

/**
 * Draw cloche handle, dome arc, and plate around an intact square QR.
 * All strokes sit on top — QR pixels underneath stay 100% readable by scanners.
 */
export function drawClocheDecorAroundQr(
  ctx: CanvasRenderingContext2D,
  qrX: number,
  qrY: number,
  qrSize: number,
  pad = 0,
) {
  const padUse = pad || qrSize * 0.06;
  const cardTop = qrY - padUse;
  const cardW = qrSize + padUse * 2;
  const cx = qrX + qrSize / 2;
  const s = qrSize / 160;

  // Dome sits ABOVE the QR card — stroke never crosses scannable modules
  const domeR = cardW * 0.52;
  const domeCy = cardTop - 6 * s;

  ctx.save();
  ctx.strokeStyle = '#1a1a1a';
  ctx.fillStyle = '#1a1a1a';
  ctx.lineWidth = Math.max(2, 3.5 * s);
  ctx.lineCap = 'round';

  // Dome arc framing the top of the white card
  ctx.beginPath();
  ctx.arc(cx, domeCy, domeR, Math.PI, 0, false);
  ctx.stroke();

  // Side lines connecting dome to plate (cloche silhouette)
  const arcLeftX = cx - domeR;
  const arcRightX = cx + domeR;
  const plateY = qrY + qrSize + padUse + 8 * s;
  ctx.beginPath();
  ctx.moveTo(arcLeftX, domeCy);
  ctx.lineTo(arcLeftX + cardW * 0.04, plateY - 10 * s);
  ctx.moveTo(arcRightX, domeCy);
  ctx.lineTo(arcRightX - cardW * 0.04, plateY - 10 * s);
  ctx.stroke();

  // Knob + stem above dome peak
  const peakY = domeCy - domeR;
  ctx.beginPath();
  ctx.arc(cx, peakY - 12 * s, 9 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, peakY - 3 * s);
  ctx.lineTo(cx, peakY + 4 * s);
  ctx.stroke();

  // Steam above knob
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = Math.max(1.5, 2 * s);
  const knobY = peakY - 12 * s;
  for (const off of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.moveTo(cx + off * s, knobY - 10 * s);
    ctx.bezierCurveTo(
      cx + (off - 5) * s, knobY - 22 * s,
      cx + (off + 5) * s, knobY - 32 * s,
      cx + off * s, knobY - 40 * s,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Serving plate below card
  ctx.lineWidth = Math.max(2, 3 * s);
  ctx.beginPath();
  ctx.ellipse(cx, plateY, cardW * 0.56, 13 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, plateY, cardW * 0.62, 17 * s, 0, 0, Math.PI);
  ctx.stroke();

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
