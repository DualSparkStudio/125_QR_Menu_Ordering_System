import { create } from 'zustand';
import { api } from '@/lib/api';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isVegetarian: boolean;
  preparationTime: number;
  image?: string;
  category?: string;
  rating?: number;
  isAvailable?: boolean;
}

export interface Menu {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  items: MenuItem[];
}

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  capacity: number;
  status: string;
}

export interface Resort {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  taxPercentage: number;
  serviceChargePercentage: number;
}

interface ResortStore {
  resort: Resort | null;
  room: Room | null;
  menus: Menu[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;

  // Actions
  setResort: (resort: Resort) => void;
  setRoom: (room: Room) => void;
  fetchResorts: () => Promise<Resort[]>;
  fetchResortById: (resortId: string) => Promise<void>;
  fetchMenus: (resortId: string) => Promise<void>;
  fetchMenuItems: (resortId: string, menuId: string) => Promise<void>;
  fetchRoomByQR: (resortId: string, qrCode: string) => Promise<void>;
  fetchRoomById: (resortId: string, roomId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useResortStore = create<ResortStore>((set) => ({
  resort: null,
  room: null,
  menus: [],
  menuItems: [],
  loading: false,
  error: null,

  setResort: (resort) => set({ resort }),
  setRoom: (room) => set({ room }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchResorts: async () => {
    set({ loading: true, error: null });
    try {
      const resorts = await api.getResorts();
      set({ loading: false });
      return resorts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resorts';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchResortById: async (resortId: string) => {
    set({ loading: true, error: null });
    try {
      const resort = await api.getResortById(resortId);
      set({ resort, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resort';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchMenus: async (resortId: string) => {
    set({ loading: true, error: null });
    try {
      const menus = await api.getMenuForGuest(resortId);
      set({ menus, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menus';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchMenuItems: async (resortId: string, menuId: string) => {
    set({ loading: true, error: null });
    try {
      const menuItems = await api.getMenuItems(resortId, menuId);
      set({ menuItems, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu items';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchRoomByQR: async (resortId: string, qrCode: string) => {
    set({ loading: true, error: null });
    try {
      const room = await api.getRoomByQR(resortId, qrCode);
      set({ room, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  fetchRoomById: async (resortId: string, roomId: string) => {
    set({ loading: true, error: null });
    try {
      const room = await api.getRoomById(resortId, roomId);
      set({ room, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));
