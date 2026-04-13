import { create } from "zustand";
import { authClient } from "@/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  fetchSession: () => Promise<void>;
  auth: {
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  isLoading: false,
  fetchSession: async () => {
    if (get().isLoading) return;
    if (!get().session) {
      set({ isLoading: true });
    }
    try {
      const { data } = await authClient.getSession();
      set({ session: data, isLoading: false });
    } catch (error) {
      set({ session: null, isLoading: false });
      throw error;
    }
  },
  auth: {
    reset: () => set({ session: null, isLoading: false }),
  },
}));
