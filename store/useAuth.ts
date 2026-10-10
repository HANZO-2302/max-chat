import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Credentials } from "@/lib/greenApi";

type AuthState = {
  credentials: Credentials | null;
  loggedInAt: number;
  login: (c: Credentials) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      credentials: null,
      loggedInAt: 0,
      login: (credentials) => set({ credentials, loggedInAt: Date.now() }),
      logout: () => set({ credentials: null, loggedInAt: 0 }),
    }),
    { name: "max-chat-auth" },
  ),
);