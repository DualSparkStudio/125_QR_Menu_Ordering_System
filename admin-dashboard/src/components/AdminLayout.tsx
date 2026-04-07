'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/dashboard', icon: '▦',  label: 'Dashboard',  emoji: '📊' },
  { href: '/orders',    icon: '≡',  label: 'Orders',     emoji: '📋' },
  { href: '/menu',      icon: '◈',  label: 'Menu',       emoji: '🍽️' },
  { href: '/tables',    icon: '⊞',  label: 'Tables',     emoji: '🪑' },
  { href: '/staff',     icon: '◉',  label: 'Staff',      emoji: '👥' },
  { href: '/coupons',   icon: '◇',  label: 'Coupons',    emoji: '🎟️' },
  { href: '/reviews',   icon: '★',  label: 'Reviews',    emoji: '⭐' },
  { href: '/reports',   icon: '↗',  label: 'Reports',    emoji: '📈' },
  { href: '/settings',  icon: '⚙',  label: 'Settings',   emoji: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { staff, token, logout, isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push('/');
  }, []);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb]">
      {/* Sidebar */}
      <aside className={`sidebar flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[220px]'} flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-base flex-shrink-0">🍽️</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">ForkAdmin</p>
              <p className="text-white/30 text-xs capitalize truncate">{staff?.role}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-white/5 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">
                {staff?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs font-medium truncate">{staff?.name}</p>
                <p className="text-white/25 text-xs truncate">{staff?.email}</p>
              </div>
            </div>
          )}
          <button onClick={() => { logout(); router.push('/'); }}
            className={`nav-item w-full text-red-400/60 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <span className="text-base">🚪</span>
            {!collapsed && <span>Sign out</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full justify-center text-white/20 hover:text-white/50"
          >
            <span className="text-sm">{collapsed ? '→' : '←'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
