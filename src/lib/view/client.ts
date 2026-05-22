/* ============================================
 * Client-side view-mode hook
 * Persists grid/list preference in cookie + localStorage
 * Pattern mirrors LanguageProvider (dv-locale)
 * ============================================ */

"use client";

import { useCallback, useEffect, useState } from "react";
import type { ViewMode } from "./types";

const STORAGE_KEY = "directors-vault-view";
const COOKIE_NAME = "dv-view";

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

/**
 * View-mode hook. Pass the server-read value as `initial` for SSR-correct
 * first paint; client pages without server access can pass "grid".
 */
export function useView(initial: ViewMode = "grid"): [ViewMode, (next: ViewMode) => void] {
  const [view, setViewState] = useState<ViewMode>(initial);

  useEffect(() => {
    try {
      const fromCookie = getCookie(COOKIE_NAME);
      const fromLs = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const saved = fromCookie || fromLs;
      if (saved === "list" || saved === "grid") {
        setViewState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setView = useCallback((next: ViewMode) => {
    setViewState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setCookie(COOKIE_NAME, next);
  }, []);

  return [view, setView];
}
