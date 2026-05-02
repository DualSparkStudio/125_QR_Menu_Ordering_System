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
  lastFetch: number;
  categoriesCache: Record<string, { data: Category[]; timestamp: number }>;

  setRestaurant: (r: Restaurant) => void;
  setTable: (t: Table) => void;
  fetchByQR: (qrCode: string) => Promise<void>;
  fetchCategories: (restaurantId: string) => Promise<void>;
  setError: (e: string | null) => void;
}

const CACHE_DURATION = 60000; // 1 minute cache

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  restaurant: null,
  table: null,
  categories: [],
  loading: false,
  error: null,
  lastFetch: 0,
  categoriesCache: {},

  setRestaurant: (restaurant) => set({ restaurant }),
  setTable: (table) => set({ table }),
  setError: (error) => set({ error }),

  fetchByQR: async (code: string) => {
    const now = Date.now();
    const { lastFetch } = get();
    
    // Skip if fetched recently (within 5 seconds)
    if (now - lastFetch < 5000) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const BASE = '/api';
      // Detect if it's a UUID (QR code) or a plain table number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
      const url = isUUID ? `${BASE}/tables/qr/${code}` : `${BASE}/tables/number/${code}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Table not found');
      }
      const data: any = await res.json();
      set({ table: data, restaurant: data.restaurant, loading: false, lastFetch: now });
    } catch (e: any) {
      set({ error: e.message || 'Table not found', loading: false });
    }
  },

  fetchCategories: async (restaurantId: string) => {
    const now = Date.now();
    const { categoriesCache } = get();
    
    // Check cache first
    const cached = categoriesCache[restaurantId];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      set({ categories: cached.data, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const categories: any = await api.getCategories(restaurantId);
      set({ 
        categories, 
        loading: false,
        categoriesCache: {
          ...categoriesCache,
          [restaurantId]: { data: categories, timestamp: now }
        }
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
