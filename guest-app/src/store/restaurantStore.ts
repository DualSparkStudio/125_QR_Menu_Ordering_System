import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  basePrice: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: number;
  allergens?: string;
  calories?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  variants: any[];
  category?: { id: string; name: string };
}

export interface Table {
  id: string;
  tableNumber: string;
  section: string;
  capacity: number;
  status: string;
  qrCode: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  currency: string;
  taxPercentage: number;
  serviceChargePercentage: number;
  isOpen: boolean;
  phone: string;
  address: string;
}

interface RestaurantStore {
  restaurant: Restaurant | null;
  table: Table | null;
  categories: Category[];
  loading: boolean;
  error: string | null;

  setRestaurant: (r: Restaurant) => void;
  setTable: (t: Table) => void;
  fetchByQR: (qrCode: string) => Promise<void>;
  fetchCategories: (restaurantId: string) => Promise<void>;
  setError: (e: string | null) => void;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurant: null,
  table: null,
  categories: [],
  loading: false,
  error: null,

  setRestaurant: (restaurant) => set({ restaurant }),
  setTable: (table) => set({ table }),
  setError: (error) => set({ error }),

  fetchByQR: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Detect if it's a UUID (QR code) or a plain table number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
      const url = isUUID ? `${BASE}/tables/qr/${code}` : `${BASE}/tables/number/${code}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Table not found');
      }
      const data: any = await res.json();
      set({ table: data, restaurant: data.restaurant, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Table not found', loading: false });
    }
  },

  fetchCategories: async (restaurantId: string) => {
    set({ loading: true });
    try {
      const categories: any = await api.getCategories(restaurantId);
      set({ categories, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
