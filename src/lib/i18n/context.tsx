/* ============================================
 * i18n Context — Language Provider
 * Persists preference in localStorage + cookie
 * Cookie enables server components to read locale
 * ============================================ */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import es from "./translations/es";
import en from "./translations/en";

export type Locale = "es" | "en";

const translations: Record<Locale, Record<string, string>> = {
  es: es as unknown as Record<string, string>,
  en,
};

/** TMDB language codes mapped to our locales */
export const TMDB_LOCALES: Record<Locale, string> = {
  es: "es-MX",
  en: "en-US",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tmdbLocale: string;
  country: string;
  setCountry: (country: string) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "directors-vault-lang";
const COOKIE_NAME = "dv-locale";
const COUNTRY_STORAGE_KEY = "directors-vault-country";
const COUNTRY_COOKIE_NAME = "dv-country";

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [country, setCountryState] = useState("CO");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const cookieLocale = getCookie(COOKIE_NAME);
      const lsLocale = localStorage.getItem(STORAGE_KEY);
      const saved = cookieLocale || lsLocale;
      if (saved === "en" || saved === "es") {
        setLocaleState(saved);
      }
      const cookieCountry = getCookie(COUNTRY_COOKIE_NAME);
      const lsCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
      const savedCountry = cookieCountry || lsCountry;
      if (savedCountry) {
        setCountryState(savedCountry);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // localStorage not available
    }
    setCookie(COOKIE_NAME, newLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const setCountry = useCallback((newCountry: string) => {
    setCountryState(newCountry);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, newCountry);
    } catch {
      // localStorage not available
    }
    setCookie(COUNTRY_COOKIE_NAME, newCountry);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text = translations[locale]?.[key] || translations.es?.[key as keyof typeof es] || key;

      // Replace variables like {count}, {query}, etc.
      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue));
        }
      }

      // Handle plurals: {s} becomes "" for 1, "s" otherwise
      if (vars?.count !== undefined) {
        const count = Number(vars.count);
        text = text.replace(/\{s\}/g, count === 1 ? "" : "s");
      }

      return text;
    },
    [locale]
  );

  const tmdbLocale = TMDB_LOCALES[locale];

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "es", setLocale, t, tmdbLocale: "es-MX", country: "CO", setCountry }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tmdbLocale, country, setCountry }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
