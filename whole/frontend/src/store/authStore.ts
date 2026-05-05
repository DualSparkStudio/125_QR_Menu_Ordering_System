import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      staff: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res: any = await adminApi.login(email, password);
          set({ staff: res.staff, token: res.accessToken, loading: false });
        } catch (e: any) {
          set({ error: e.message, loading: false });
          throw e;
        }
      },

      logout: () => set({ staff: null, token: null }),

      isAuthenticated: () => !!get().token && !!get().staff,
    }),
    { name: 'admin-auth' }
  )
);
