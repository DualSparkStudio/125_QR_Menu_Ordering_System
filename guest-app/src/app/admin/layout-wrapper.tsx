'use client';

import AdminLayout from '@/components/AdminLayout';

export default function AdminLayoutWrapper({ 
  children, 
  onLogout 
}: { 
  children: React.ReactNode;
  onLogout: () => void;
}) {
  return <AdminLayout onLogout={onLogout}>{children}</AdminLayout>;
}
