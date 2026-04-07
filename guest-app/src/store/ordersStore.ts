import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  roomId: string;
  guestName?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: Date;
  notes?: string;
}

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  getOrdersByRoom: (roomId: string) => Order[];
  getPendingOrders: () => Order[];
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `ORD-${Date.now()}`,
          timestamp: new Date(),
          status: 'pending',
        };
        
        set((state) => ({ 
          orders: [newOrder, ...state.orders] 
        }));
        
        return newOrder.id;
      },
      
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        }));
      },
      
      getOrdersByRoom: (roomId) => {
        return get().orders.filter((order) => order.roomId === roomId);
      },
      
      getPendingOrders: () => {
        return get().orders.filter((order) => 
          order.status === 'pending' || order.status === 'preparing'
        );
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);
