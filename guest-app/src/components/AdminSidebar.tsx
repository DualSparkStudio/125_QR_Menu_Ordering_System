'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems: SidebarItem[] = [
    { label: 'Dashboard', icon: '📊', href: '/admin' },
    { label: 'Orders', icon: '📦', href: '/admin/orders' },
    { label: 'Services', icon: '🧹', href: '/admin/services' },
    { label: 'Rooms', icon: '🛏️', href: '/admin/rooms' },
    { label: 'Reports', icon: '📈', href: '/admin/reports' },
    { label: 'Settings', icon: '⚙️', href: '/admin/settings' },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-blue-950 p-2 rounded-lg transition lg:hidden"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-blue-950/95 backdrop-blur-xl border-r border-yellow-400/20 w-64 pt-20 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-yellow-400/20">
          <h2 className="text-2xl font-serif font-bold text-white">Admin</h2>
          <p className="text-xs text-yellow-300 font-light">Resort Management</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-blue-950 font-semibold'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-serif">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-yellow-400/20">
          <button className="w-full bg-red-500/30 hover:bg-red-500/50 text-red-200 px-4 py-2 rounded-lg transition border border-red-500/50 font-semibold text-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
