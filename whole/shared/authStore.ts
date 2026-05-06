import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string;
}

interface StaffLoginResponse {
  staff: StaffUser;
  accessToken: string;
}

interface AdminApiLike {
  staffLogin: (email: string, password: string) => Promise<StaffLoginResponse>;
}

export interface AuthStoreState {
  staff: StaffUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function createAuthStore(adminApi: AdminApiLike) {
  return create<AuthStoreState>()(
    persist(
      (set) => ({
        staff: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,

        login: async (email, password) => {
          set({ loading: true, error: null });
          try {
            const res = await adminApi.staffLogin(email, password);
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
        name: "admin-auth",
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isAuthenticated = !!(state.token && state.staff);
          }
        },
      }
    )
  );
}
