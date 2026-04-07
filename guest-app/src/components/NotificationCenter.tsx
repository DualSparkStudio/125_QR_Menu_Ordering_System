'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationCenter() {
  const { notifications, markAsRead, removeNotification } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'service':
        return '🧹';
      case 'payment':
        return '💳';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-200';
      case 'service':
        return 'bg-purple-50 border-purple-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative bg-white hover:bg-gray-50 text-pista-700 px-3 sm:px-4 py-2 rounded-lg transition border border-pista-200 font-medium shadow-sm flex items-center gap-2"
      >
        <span className="text-lg sm:text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => setShowNotifications(false)}
          ></div>
          
          {/* Notification Panel */}
          <div className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-0 bottom-0 sm:bottom-auto top-auto sm:top-12 w-full sm:w-96 bg-white border-t-2 sm:border-2 border-pista-300 rounded-t-2xl sm:rounded-2xl shadow-2xl z-50 max-h-[80vh] sm:max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 flex-shrink-0">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-pista-200">
                <h3 className="text-lg sm:text-xl font-bold text-pista-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition text-xl"
                >
                  ✕
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-3">🔔</span>
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(80vh-120px)] sm:max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition cursor-pointer ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-pista-50 border-pista-300 shadow-sm'
                      } hover:shadow-md`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-pista-900 text-sm sm:text-base truncate">{notification.title}</p>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition text-lg flex-shrink-0 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 ml-8 sm:ml-12">{notification.message}</p>
                      {!notification.read && (
                        <div className="mt-3 flex items-center gap-2 ml-8 sm:ml-12">
                          <div className="h-2 w-2 bg-pista-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-pista-700 font-semibold">NEW</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
