import { renderClocheQrCanvas } from './clocheQrRender';
import { drawSparkle } from './qrClocheShape';

export const TENT_CARD_W = 600;
export const TENT_CARD_H = 900;

export interface TableTentCardInput {
  restaurantName: string;
  logoUrl?: string | null;
  tableNumber: string | number;
  section?: string;
  qrCode: string;
  qrUrl: string;
}

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

function drawDotPattern(ctx: CanvasRenderingContext2D, w: number, y0: number, h: number, s: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  const gap = 22 * s;
  for (let y = y0 + 10 * s; y < y0 + h; y += gap) {
    for (let x = 10 * s; x < w; x += gap) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

async function renderTableTentCanvas(
  input: TableTentCardInput,
  scale: number,
): Promise<HTMLCanvasElement> {
  const w = TENT_CARD_W * scale;
  const h = TENT_CARD_H * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const s = scale;

  const headerH = 108 * s;
  const footerH = 138 * s;
  const bodyH = h - headerH - footerH;

  // Card rounded bg
  ctx.fillStyle = '#fff';
  roundRect(ctx, 0, 0, w, h, 20 * s);
  ctx.fill();

  // ── Header (warm cream gradient) ──
  const headerGrad = ctx.createLinearGradient(0, 0, w, headerH);
  headerGrad.addColorStop(0, '#FFF8F0');
  headerGrad.addColorStop(1, '#FFE8D0');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, w, headerH);

  // Logo area
  let logoDrawn = false;
  if (input.logoUrl) {
    try {
      const logo = await loadImage(input.logoUrl);
      const logoH = 58 * s;
      const logoW = Math.min((logo.width / logo.height) * logoH, 150 * s);
      ctx.drawImage(logo, 22 * s, (headerH - logoH) / 2, logoW, logoH);
      logoDrawn = true;
    } catch { logoDrawn = false; }
  }
  if (!logoDrawn) {
    ctx.font = `${28 * s}px serif`;
    ctx.fillText('🍽️', 22 * s, headerH / 2 + 10 * s);
    ctx.fillStyle = '#3D2314';
    ctx.font = `bold ${13 * s}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    const name = input.restaurantName.length > 16
      ? `${input.restaurantName.slice(0, 16)}…`
      : input.restaurantName;
    ctx.fillText(name, 56 * s, headerH / 2 + 4 * s);
    ctx.font = `600 ${10 * s}px system-ui, sans-serif`;
    ctx.fillStyle = '#9A6B4A';
    ctx.fillText('Welcome!', 56 * s, headerH / 2 + 20 * s);
  }

  // Table badge — warm orange pill
  const badgeW = 118 * s;
  const badgeH = 54 * s;
  const badgeX = w - badgeW - 18 * s;
  const badgeY = (headerH - badgeH) / 2;
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
  badgeGrad.addColorStop(0, '#FF6B35');
  badgeGrad.addColorStop(1, '#E85D04');
  ctx.fillStyle = badgeGrad;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 14 * s);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `bold ${9 * s}px system-ui, sans-serif`;
  ctx.fillText('YOUR TABLE', badgeX + badgeW / 2, badgeY + 18 * s);
  ctx.font = `900 ${26 * s}px system-ui, sans-serif`;
  ctx.fillText(String(input.tableNumber).padStart(2, '0'), badgeX + badgeW / 2, badgeY + 44 * s);

  // ── Body (joyful golden gradient) ──
  const bodyGrad = ctx.createLinearGradient(0, headerH, 0, headerH + bodyH);
  bodyGrad.addColorStop(0, '#FFB703');
  bodyGrad.addColorStop(0.5, '#FFC93C');
  bodyGrad.addColorStop(1, '#FF9500');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, headerH, w, bodyH);
  drawDotPattern(ctx, w, headerH, bodyH, s);

  // Sparkles
  const sparkles = [
    [40 * s, headerH + 30 * s, 5 * s],
    [w - 45 * s, headerH + 50 * s, 4 * s],
    [55 * s, headerH + bodyH - 40 * s, 4 * s],
    [w - 60 * s, headerH + bodyH - 55 * s, 5 * s],
  ] as const;
  sparkles.forEach(([x, y, r]) => drawSparkle(ctx, x, y, r, 'rgba(255,255,255,0.7)'));

  // Headline
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${30 * s}px system-ui, sans-serif`;
  ctx.shadowColor = 'rgba(180,80,0,0.35)';
  ctx.shadowBlur = 6 * s;
  ctx.fillText('Order with a Smile!', w / 2, headerH + 44 * s);
  ctx.shadowBlur = 0;
  ctx.font = `600 ${12 * s}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText('Scan below — good food awaits  ✨', w / 2, headerH + 66 * s);

  // Food emoji accents
  ctx.font = `${22 * s}px serif`;
  ctx.fillText('🍕', 28 * s, headerH + bodyH * 0.55);
  ctx.fillText('🍔', w - 48 * s, headerH + bodyH * 0.48);
  ctx.fillText('😋', w - 42 * s, headerH + bodyH * 0.72);
  ctx.fillText('☕', 32 * s, headerH + bodyH * 0.78);

  // Cloche QR — filled & dense
  const clocheW = Math.round(300 * s);
  const clocheCanvas = await renderClocheQrCanvas(input.qrUrl, clocheW);
  const clocheX = (w - clocheW) / 2;
  const clocheY = headerH + bodyH * 0.32;
  ctx.drawImage(clocheCanvas, clocheX, clocheY, clocheW, clocheCanvas.height * (clocheW / clocheCanvas.width));

  // ── Footer (warm dark brown) ──
  const footerGrad = ctx.createLinearGradient(0, h - footerH, 0, h);
  footerGrad.addColorStop(0, '#2D1810');
  footerGrad.addColorStop(1, '#1A0F0A');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, h - footerH, w, footerH);

  // Orange accent stripe
  ctx.fillStyle = '#FF6B35';
  ctx.fillRect(0, h - footerH, w, 4 * s);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `bold ${13 * s}px system-ui, sans-serif`;
  ctx.fillText('📱  Scan to Browse Our Menu', w / 2, h - footerH + 38 * s);
  ctx.font = `600 ${10 * s}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Special Offers  ·  Chef\'s Picks  ·  Easy Ordering', w / 2, h - footerH + 60 * s);

  if (input.section) {
    ctx.font = `bold ${9 * s}px system-ui, sans-serif`;
    ctx.fillStyle = '#FFB703';
    ctx.fillText(`✦  ${input.section.toUpperCase()} SEATING  ✦`, w / 2, h - 24 * s);
  }

  return canvas;
}

export async function getTableTentCardDataUrl(
  input: TableTentCardInput,
  scale = 2,
): Promise<string> {
  const canvas = await renderTableTentCanvas(input, scale);
  return canvas.toDataURL('image/png');
}

export async function downloadTableTentCard(input: TableTentCardInput) {
  const dataUrl = await getTableTentCardDataUrl(input, 3);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Table-Tent-${input.tableNumber}-${input.restaurantName.replace(/\s+/g, '-')}.png`;
  link.click();
}

export function buildTableTentPrintHtml(
  cards: { dataUrl: string; tableNumber: string | number }[],
  restaurantName: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Table Tents — ${restaurantName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #fff; }
    .page { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px; justify-content: center; }
    .card { page-break-inside: avoid; }
    .card img { width: 300px; height: 450px; object-fit: contain; display: block; }
    @media print {
      .page { gap: 8px; padding: 8px; }
      .card img { width: 280px; height: 420px; }
      @page { margin: 8mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${cards.map((c) => `
      <div class="card">
        <img src="${c.dataUrl}" alt="Table ${c.tableNumber} tent card" />
      </div>
    `).join('')}
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`;
}
