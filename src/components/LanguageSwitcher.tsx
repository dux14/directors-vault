/* ============================================
 * LanguageSwitcher — ES ↔ EN toggle
 * ============================================ */

"use client";

import { useTranslation, type Locale } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

interface Props {
  variant?: "compact" | "full";
}

export default function LanguageSwitcher({ variant = "compact" }: Props) {
  const { locale, setLocale } = useTranslation();
  const router = useRouter();

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    // Refresh server components so TMDB fetches run with the new locale cookie
    router.refresh();
  };

  if (variant === "full") {
    return (
      <div className={styles.fullWrapper}>
        <button
          onClick={() => changeLocale("es")}
          className={`${styles.langBtn} ${locale === "es" ? styles.active : ""}`}
          id="lang-es"
        >
          ES
        </button>
        <button
          onClick={() => changeLocale("en")}
          className={`${styles.langBtn} ${locale === "en" ? styles.active : ""}`}
          id="lang-en"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => changeLocale(locale === "es" ? "en" : "es")}
      className={styles.toggle}
      id="language-toggle"
      title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className={styles.toggleLabel}>{locale.toUpperCase()}</span>
    </button>
  );
}
