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
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      staff: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      hydrated: false,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res: any = await adminApi.staffLogin(email, password);
          set({
            staff: res.staff,
            token: res.accessToken,
            loading: false,
            isAuthenticated: true,
          });
        } catch (e: any) {
          set({ error: e.message, loading: false, isAuthenticated: false });
          throw e;
        }
      },

      logout: () => set({ staff: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        staff: state.staff,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token && state.staff) {
            state.isAuthenticated = true;
          }
          state.hydrated = true;
        }
      },
    }
  )
);
