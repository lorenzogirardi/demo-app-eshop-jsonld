"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "admin-token";

/** Shared admin fetch: keeps the token in sessionStorage and flags a 401 so the page can ask for it. */
export function useAdminFetch() {
  const [token, setToken] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(KEY) ?? "");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const saveToken = useCallback((t: string) => {
    setToken(t);
    try {
      sessionStorage.setItem(KEY, t);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const adminFetch = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init.headers ?? {}),
        },
      });
      setUnauthorized(res.status === 401);
      return res;
    },
    [token]
  );

  return { token, saveToken, adminFetch, unauthorized };
}
