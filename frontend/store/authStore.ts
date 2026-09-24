"use client";

import { create } from "zustand";
import type { CurrentUser, UserRole } from "@/lib/api";

interface AuthState {
  token: string | null;
  role: UserRole | null;
  fullName: string | null;
  email: string | null;
  isHydrated: boolean;
  setSession: (params: {
    token: string;
    role: UserRole;
    fullName: string;
    email: string;
  }) => void;
  setUser: (user: CurrentUser) => void;
  logout: () => void;
  hydrate: () => void;
}

const TOKEN_KEY = "wazifny_token";
const ROLE_KEY = "wazifny_role";
const NAME_KEY = "wazifny_name";
const EMAIL_KEY = "wazifny_email";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  fullName: null,
  email: null,
  isHydrated: false,

  setSession: ({ token, role, fullName, email }) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(ROLE_KEY, role);
      window.localStorage.setItem(NAME_KEY, fullName);
      window.localStorage.setItem(EMAIL_KEY, email);
    }
    setCookie(TOKEN_KEY, token);
    setCookie(ROLE_KEY, role);
    set({ token, role, fullName, email });
  },

  setUser: (user) => {
    set({ role: user.role, fullName: user.full_name, email: user.email });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(ROLE_KEY);
      window.localStorage.removeItem(NAME_KEY);
      window.localStorage.removeItem(EMAIL_KEY);
    }
    clearCookie(TOKEN_KEY);
    clearCookie(ROLE_KEY);
    set({ token: null, role: null, fullName: null, email: null });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(TOKEN_KEY);
    const role = window.localStorage.getItem(ROLE_KEY) as UserRole | null;
    const fullName = window.localStorage.getItem(NAME_KEY);
    const email = window.localStorage.getItem(EMAIL_KEY);
    set({ token, role, fullName, email, isHydrated: true });
  },
}));

/** Where to send a user right after login/register, based on their role.
 * Talent/employer share a single generic dashboard for now (the dedicated
 * (talent)/(employer) dashboards in the route groups aren't built yet);
 * admins go straight to the admin overview. */
export function dashboardPathForRole(role: UserRole): string {
  if (role === "admin") return "/overview";
  if (role === "talent") return "/talent/matches";
  if (role === "employer") return "/employer/dashboard";
  return "/dashboard";
}
