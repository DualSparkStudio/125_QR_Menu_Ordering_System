import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Menu — Order at your table',
  description: 'Scan, browse, and order from your table',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
