"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/** Restores the session from localStorage, re-validates the token against
 * the backend (`GET /auth/me`), and redirects to /login if it's missing or
 * no longer valid (expired token, deleted/blocked user, etc.). */
export function useRequireAuth() {
  const router = useRouter();
  const { token, hydrate, logout, setUser } = useAuthStore();
  const [user, setLocalUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const storedToken = token ?? window.localStorage.getItem("wazifny_token");
    if (!storedToken) {
      router.replace("/login");
      return;
    }

    getCurrentUser(storedToken)
      .then((me) => {
        setUser(me);
        setLocalUser(me);
        setStatus("ready");
      })
      .catch(() => {
        logout();
        setStatus("error");
        router.replace("/login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { user, status };
}
