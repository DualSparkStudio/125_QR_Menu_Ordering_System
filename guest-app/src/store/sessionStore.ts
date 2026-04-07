import { create } from 'zustand';

interface SessionStore {
  sessionToken: string | null;
  roomId: string | null;
  resortId: string | null;
  setSession: (token: string, roomId: string, resortId: string) => void;
  clearSession: () => void;
  isSessionActive: () => boolean;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionToken: null,
  roomId: null,
  resortId: null,

  setSession: (token, roomId, resortId) =>
    set({ sessionToken: token, roomId, resortId }),

  clearSession: () =>
    set({ sessionToken: null, roomId: null, resortId: null }),

  isSessionActive: () => {
    const state = get();
    return !!state.sessionToken && !!state.roomId;
  },
}));
