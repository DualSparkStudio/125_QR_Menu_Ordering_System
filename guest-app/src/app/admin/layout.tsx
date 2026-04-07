'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      // If on login page, don't check auth
      if (pathname === '/admin') {
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }
      
      // For other admin pages, check if logged in
      const isAuth = sessionStorage.getItem('adminLoggedIn') === 'true';
      
      if (!isAuth) {
        // Not logged in, redirect to login
        router.push('/admin');
        setIsLoading(false);
      } else {
        // Logged in, show the page
        setIsLoggedIn(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    router.push('/admin');
  };

  // If on login page, render children directly
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen pista-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pista-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pista-700 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Render with admin layout for authenticated pages
  if (isLoggedIn) {
    return (
      <AdminLayout onLogout={handleLogout}>
        {children}
      </AdminLayout>
    );
  }

  // If not logged in and not loading, return null (will redirect)
  return null;
}
