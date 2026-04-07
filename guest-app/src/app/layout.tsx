import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Menu — Order at your table',
  description: 'Scan, browse, and order from your table',
  themeColor: '#0a0a0a',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}
