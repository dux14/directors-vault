/* ============================================
 * LanguageSwitcher — ES ↔ EN toggle
 * ============================================ */

"use client";

import { useTranslation, type Locale } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

const COUNTRIES = [
  { code: "CO", label: "Colombia" },
  { code: "MX", label: "México" },
  { code: "AR", label: "Argentina" },
  { code: "CL", label: "Chile" },
  { code: "PE", label: "Perú" },
  { code: "ES", label: "España" },
  { code: "US", label: "USA" },
  { code: "BR", label: "Brasil" },
  { code: "GB", label: "UK" },
];

interface Props {
  variant?: "compact" | "full";
}

export default function LanguageSwitcher({ variant = "compact" }: Props) {
  const { locale, setLocale, country, setCountry } = useTranslation();
  const router = useRouter();

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    router.refresh();
  };

  const changeCountry = (newCountry: string) => {
    setCountry(newCountry);
    router.refresh();
  };

  if (variant === "full") {
    return (
      <div className={styles.fullGroup}>
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
        <select
          value={country}
          onChange={(e) => changeCountry(e.target.value)}
          className={styles.countrySelect}
          id="country-select"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.settingsRow}>
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
      <select
        value={country}
        onChange={(e) => changeCountry(e.target.value)}
        className={styles.countrySelect}
        id="country-select-compact"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.code}</option>
        ))}
      </select>
    </div>
  );
}
