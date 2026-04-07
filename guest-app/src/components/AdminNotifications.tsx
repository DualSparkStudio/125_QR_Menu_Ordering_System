'use client';

import { useEffect, useState } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
import { useServiceRequestsStore } from '@/store/serviceRequestsStore';

export default function AdminNotifications() {
  const { orders } = useOrdersStore();
  const { requests } = useServiceRequestsStore();
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'order' | 'service'; message: string; timestamp: Date }>>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check for new orders
    const latestOrder = orders[0];
    if (latestOrder && latestOrder.status === 'pending') {
      const orderTime = new Date(latestOrder.timestamp).getTime();
      const now = Date.now();
      
      // Show notification if order is less than 5 seconds old
      if (now - orderTime < 5000) {
        const newNotif = {
          id: latestOrder.id,
          type: 'order' as const,
          message: `New order from Room ${latestOrder.roomId} - ₹${latestOrder.total}`,
          timestamp: new Date(latestOrder.timestamp),
        };
        
        setNotifications(prev => {
          if (!prev.find(n => n.id === newNotif.id)) {
            return [newNotif, ...prev].slice(0, 5);
          }
          return prev;
        });
        setVisible(true);
        
        // Play notification sound
        playNotificationSound();
        
        // Auto-hide after 5 seconds
        setTimeout(() => setVisible(false), 5000);
      }
    }
  }, [orders]);

  useEffect(() => {
    // Check for new service requests
    const latestRequest = requests[0];
    if (latestRequest && latestRequest.status === 'pending') {
      const requestTime = new Date(latestRequest.timestamp).getTime();
      const now = Date.now();
      
      // Show notification if request is less than 5 seconds old
      if (now - requestTime < 5000) {
        const newNotif = {
          id: latestRequest.id,
          type: 'service' as const,
          message: `New ${latestRequest.serviceName} request from Room ${latestRequest.roomId}`,
          timestamp: new Date(latestRequest.timestamp),
        };
        
        setNotifications(prev => {
          if (!prev.find(n => n.id === newNotif.id)) {
            return [newNotif, ...prev].slice(0, 5);
          }
          return prev;
        });
        setVisible(true);
        
        // Play notification sound
        playNotificationSound();
        
        // Auto-hide after 5 seconds
        setTimeout(() => setVisible(false), 5000);
      }
    }
  }, [requests]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'pending' || r.status === 'assigned').length;
  const totalPending = pendingOrdersCount + pendingRequestsCount;

  if (!visible && notifications.length === 0) return null;

  return (
    <>
      {/* Notification Badge */}
      {totalPending > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setVisible(!visible)}
            className="relative bg-pista-500 hover:bg-pista-600 text-white rounded-full p-3 shadow-lg transition"
          >
            <span className="text-2xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {totalPending}
            </span>
          </button>
        </div>
      )}

      {/* Notification Popup */}
      {visible && notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <div className="glass-effect border-2 border-pista-300 rounded-xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="bg-pista-500 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">New Notifications</h3>
              <button
                onClick={() => setVisible(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 border-b border-pista-200 hover:bg-pista-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {notif.type === 'order' ? '🛒' : '🧹'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-pista-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-pista-50 px-4 py-3 text-center">
              <p className="text-xs text-pista-700 font-semibold">
                {pendingOrdersCount} pending orders • {pendingRequestsCount} pending requests
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
