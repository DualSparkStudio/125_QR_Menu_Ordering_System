'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNotifications from './AdminNotifications';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Orders', path: '/admin/orders', icon: '🛒' },
    { name: 'Services', path: '/admin/services', icon: '🧹' },
    { name: 'Rooms', path: '/admin/rooms', icon: '🛏️' },
    { name: 'Menu', path: '/admin/menu', icon: '🍽️' },
    { name: 'Reports', path: '/admin/reports', icon: '📈' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="h-screen pista-gradient flex overflow-hidden">
      {/* Admin Notifications */}
      <AdminNotifications />
      
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-effect border-r-2 border-pista-300 transition-all duration-300 flex flex-col shadow-xl fixed left-0 top-0 bottom-0 z-10 hidden md:flex`}
      >
        {/* Logo */}
        <div className="p-6 border-b-2 border-pista-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pista-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">🏨</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-pista-900">Grand Valley</h1>
                <p className="text-xs text-pista-600">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-pista-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-pista-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle & Logout */}
        <div className="p-4 border-t-2 border-pista-200 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-pista-100 transition"
          >
            <span className="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span className="font-medium">Collapse</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto h-screen ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300 relative z-10`}>
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 glass-effect border-b-2 border-pista-300 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pista-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">🏨</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-pista-900">Grand Valley</h1>
              <p className="text-xs text-pista-600">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
        
        <div className="relative z-0">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t-2 border-pista-300 z-30 shadow-lg">
          <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
            <Link
              href="/admin/dashboard"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/dashboard'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">📊</span>
              <span className="text-[10px] font-medium leading-tight">Dashboard</span>
            </Link>
            <Link
              href="/admin/orders"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/orders'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">🛒</span>
              <span className="text-[10px] font-medium leading-tight">Orders</span>
            </Link>
            <Link
              href="/admin/services"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/services'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">🧹</span>
              <span className="text-[10px] font-medium leading-tight">Services</span>
            </Link>
            <Link
              href="/admin/rooms"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/rooms'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">🛏️</span>
              <span className="text-[10px] font-medium leading-tight">Rooms</span>
            </Link>
            <Link
              href="/admin/menu"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/menu'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">🍽️</span>
              <span className="text-[10px] font-medium leading-tight">Menu</span>
            </Link>
            <Link
              href="/admin/reports"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/reports'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">📈</span>
              <span className="text-[10px] font-medium leading-tight">Reports</span>
            </Link>
            <Link
              href="/admin/settings"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px] ${
                pathname === '/admin/settings'
                  ? 'bg-pista-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-pista-100'
              }`}
            >
              <span className="text-base">⚙️</span>
              <span className="text-[10px] font-medium leading-tight">Settings</span>
            </Link>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="bg-gradient-to-l from-white/90 to-transparent w-8 h-full"></div>
          </div>
        </nav>
      </main>
    </div>
  );
}
