'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '📋', label: 'Orders' },
  { href: '/menu', icon: '🍽️', label: 'Menu' },
  { href: '/tables', icon: '🪑', label: 'Tables' },
  { href: '/staff', icon: '👥', label: 'Staff' },
  { href: '/coupons', icon: '🎟️', label: 'Coupons' },
  { href: '/reviews', icon: '⭐', label: 'Reviews' },
  { href: '/reports', icon: '📈', label: 'Reports' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { staff, token, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/');
  }, []);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">🍽️</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Restaurant Admin</p>
              <p className="text-xs text-gray-500 capitalize">{staff?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
              {staff?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{staff?.name}</p>
              <p className="text-xs text-gray-500 truncate">{staff?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/'); }} className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors text-left px-2 py-1">
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
