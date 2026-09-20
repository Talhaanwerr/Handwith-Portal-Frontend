import { create } from "zustand";
import { libraryAuthApi, type LibraryAuthUser, type LibraryRegisterInput } from "./auth-api";
import { libraryTokenManager } from "@/lib/library-token";
import {
  setLibrarySessionCookie,
  clearLibrarySessionCookie,
  type LibraryTier,
} from "@/lib/library-session-cookie";
import { ROUTES } from "@/constants";

type LibraryAuthState = {
  user: LibraryAuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, redirect?: string) => Promise<void>;
  register: (input: LibraryRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (accessToken: string, user: LibraryAuthUser) => void;
  clearSession: () => void;
};

function applySession(accessToken: string, user: LibraryAuthUser) {
  libraryTokenManager.setAccessToken(accessToken);
  setLibrarySessionCookie({ tier: user.tier as LibraryTier });
}

export const useLibraryAuthStore = create<LibraryAuthState>((set) => ({
  user: null,
  isLoading: false,

  setSession(accessToken, user) {
    applySession(accessToken, user);
    set({ user });
  },

  clearSession() {
    libraryTokenManager.clearAll();
    clearLibrarySessionCookie();
    set({ user: null });
  },

  async login(email, password, redirect) {
    set({ isLoading: true });
    try {
      const res = await libraryAuthApi.login({ email, password });
      if (!res.data) throw new Error("Login failed");
      const { accessToken, user } = res.data;
      applySession(accessToken, user);
      set({ user });
      if (typeof window !== "undefined") {
        window.location.href = redirect || ROUTES.LIBRARY_DASHBOARD;
      }
    } finally {
      set({ isLoading: false });
    }
  },

  async register(input) {
    set({ isLoading: true });
    try {
      const res = await libraryAuthApi.register(input);
      if (!res.data) throw new Error("Registration failed");
      const { accessToken, user } = res.data;
      applySession(accessToken, user);
      set({ user });
      if (typeof window !== "undefined") {
        window.location.href = `${ROUTES.LIBRARY_VERIFY_EMAIL}?pending=1`;
      }
    } finally {
      set({ isLoading: false });
    }
  },

  async logout() {
    set({ isLoading: true });
    try {
      await libraryAuthApi.logout().catch(() => undefined);
    } finally {
      libraryTokenManager.clearAll();
      clearLibrarySessionCookie();
      set({ user: null, isLoading: false });
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.LIBRARY;
      }
    }
  },
}));
