/* ============================================
 * i18n Context — Language Provider
 * Persists preference in localStorage
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
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "directors-vault-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [mounted, setMounted] = useState(false);

  // Load saved locale on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "es") {
        setLocaleState(saved);
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
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
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

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "es", setLocale, t, tmdbLocale: "es-MX" }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tmdbLocale }}>
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
