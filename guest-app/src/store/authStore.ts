import { create } from 'zustand';
import { adminApi } from '@/lib/api';

interface Staff {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string;
}

interface AuthStore {
  staff: Staff | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  staff: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res: any = await adminApi.login(email, password);
      set({ staff: res.staff, token: res.accessToken, loading: false });
      // Store in localStorage manually
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-auth', JSON.stringify({ staff: res.staff, token: res.accessToken }));
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  logout: () => {
    set({ staff: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-auth');
    }
  },

  isAuthenticated: () => {
    const state = get();
    // Try to restore from localStorage if not in state
    if (!state.token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin-auth');
      if (stored) {
        const data = JSON.parse(stored);
        set({ staff: data.staff, token: data.token });
        return true;
      }
    }
    return !!state.token && !!state.staff;
  },
}));
