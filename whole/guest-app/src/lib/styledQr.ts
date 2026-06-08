import type { Options } from 'qr-code-styling';

const QR_BLACK = '#000000';
const QR_WHITE = '#ffffff';

/** Public guest-app URL — must be reachable from customer phones when they scan */
export function getGuestAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_GUEST_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    '';
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

/** Direct menu link — each table's unique qrCode resolves to that table only */
export function getTableQrUrl(qrCode: string): string {
  const base = getGuestAppBaseUrl();
  return `${base}/menu?table=${encodeURIComponent(qrCode)}`;
}

/** Dense square QR — fills cloche clip with minimal empty space */
export function getTentQrOptions(data: string, size: number): Options {
  return {
    width: size,
    height: size,
    type: 'canvas',
    shape: 'square',
    data,
    margin: 2,
    qrOptions: { errorCorrectionLevel: 'H' },
    dotsOptions: {
      color: QR_BLACK,
      type: 'extra-rounded',
    },
    cornersSquareOptions: {
      color: QR_BLACK,
      type: 'extra-rounded',
    },
    cornersDotOptions: {
      color: QR_BLACK,
      type: 'dot',
    },
    backgroundOptions: {
      color: QR_WHITE,
    },
  };
}

export function getStyledQrOptions(data: string, size: number): Options {
  return getTentQrOptions(data, size);
}

export async function createStyledQr(data: string, size = 300) {
  const QRCodeStyling = (await import('qr-code-styling')).default;
  return new QRCodeStyling(getTentQrOptions(data, size));
}

export async function getTentQrDataUrl(data: string, size = 512): Promise<string> {
  const qr = await createStyledQr(data, size);
  const blob = await qr.getRawData('png');
  if (!blob) throw new Error('Failed to generate QR code');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob as Blob);
  });
}

export async function downloadStyledQr(data: string, filename: string, size = 800) {
  const qr = await createStyledQr(data, size);
  const baseName = filename.replace(/\.png$/i, '');
  await qr.download({ name: baseName, extension: 'png' });
}

export async function getStyledQrDataUrl(data: string, size = 512): Promise<string> {
  return getTentQrDataUrl(data, size);
}
