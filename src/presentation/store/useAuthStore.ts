import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/domain/entities/User";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setToken: (token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
        }
        set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true });
      },
      setToken: (token, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
        }
        set((state) => ({ 
          token, 
          refreshToken: refreshToken || state.refreshToken 
        }));
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    }
  )
);

