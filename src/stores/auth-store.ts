import { create } from "zustand";

interface AuthState {
  auth: {
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    reset: () => set((state) => ({ ...state })),
  },
}));
