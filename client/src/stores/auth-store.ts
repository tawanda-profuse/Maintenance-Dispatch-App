import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  csrfToken: string | null;
  login: (user: AuthUser, csrfToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  isHydrated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      csrfToken: null,
      isHydrated: false,

      login: (user, csrfToken) => {
        set({ isAuthenticated: true, user, csrfToken });
      },

      logout: () => {
        set({ isAuthenticated: false, user: null, csrfToken: null });
      },

      setHydrated: () => set({ isHydrated: true }),

      checkAuth: async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/login/`,
            {
              credentials: "include",
            }
          );

          if (!response.ok) {
            set({ isAuthenticated: false, user: null, csrfToken: null });
            return false;
          }

          const data = await response.json();

          if (data.user) {
            set({
              isAuthenticated: true,
              user: data.user,
              csrfToken: data.csrf_token || null,
            });
            return true;
          }

          set({ isAuthenticated: false, user: null, csrfToken: null });
          return false;
        } catch (error) {
          set({ isAuthenticated: false, user: null, csrfToken: null });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);