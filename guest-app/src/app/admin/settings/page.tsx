'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    resortName: 'Grand Valley Resort',
    email: 'admin@resort.com',
    phone: '+91 98765 43210',
    address: '123 Mountain View, Hill Station',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    currency: 'INR',
    taxRate: 18,
    serviceCharge: 10,
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    autoAssign: true,
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pista-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
        {/* Resort Information */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Resort Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resort Name</label>
              <input
                type="text"
                value={settings.resortName}
                onChange={(e) => setSettings({ ...settings, resortName: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operational Settings */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Operational Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Time</label>
              <input
                type="time"
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out Time</label>
              <input
                type="time"
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Charge (%)</label>
              <input
                type="number"
                value={settings.serviceCharge}
                onChange={(e) => setSettings({ ...settings, serviceCharge: Number(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-pista-200 rounded-lg focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
              />
              <div>
                <p className="font-semibold text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sms: e.target.checked }
                })}
                className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
              />
              <div>
                <p className="font-semibold text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: e.target.checked }
                })}
                className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
              />
              <div>
                <p className="font-semibold text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
              </div>
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-pista-900 mb-4">System Settings</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssign}
                onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })}
                className="w-5 h-5 text-pista-500 border-2 border-pista-300 rounded focus:ring-2 focus:ring-pista-500"
              />
              <div>
                <p className="font-semibold text-gray-900">Auto-assign Service Requests</p>
                <p className="text-sm text-gray-600">Automatically assign requests to available staff</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 text-red-500 border-2 border-red-300 rounded focus:ring-2 focus:ring-red-500"
              />
              <div>
                <p className="font-semibold text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Disable guest access for system maintenance</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            className="bg-pista-500 hover:bg-pista-600 text-white font-bold px-8 py-3 rounded-lg transition shadow-lg"
          >
            Save Changes
          </button>
        </div>
        </div>

        {/* Right Column - Quick Info & Stats */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-pista-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-pista-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Settings Updated', time: '5 min ago', icon: '⚙️' },
                { action: 'New Order Received', time: '12 min ago', icon: '🛒' },
                { action: 'Room Service Request', time: '25 min ago', icon: '🧹' },
                { action: 'User Login', time: '1 hour ago', icon: '👤' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-pista-100 last:border-0 last:pb-0">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="glass-effect border-2 border-pista-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-pista-900 mb-4">System Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-semibold text-gray-900">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment</span>
                <span className="font-semibold text-gray-900">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-semibold text-gray-900">Dec 15, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50">
          <span className="text-xl">✓</span>
          <span className="font-semibold">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}
