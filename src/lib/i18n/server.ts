/* ============================================
 * Server-side locale helpers
 * Reads locale from cookie in server components
 * ============================================ */

import { cookies } from "next/headers";
import type { Locale } from "./context";

const COOKIE_NAME = "dv-locale";
const COUNTRY_COOKIE_NAME = "dv-country";

/** Read the user's locale from cookie (server-side) */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;
    if (locale === "en" || locale === "es") return locale;
  } catch {
    // cookies() not available outside request context
  }
  return "es"; // default
}

/** Get the TMDB language code for the current server locale */
export async function getServerTmdbLocale(): Promise<string> {
  const locale = await getServerLocale();
  return locale === "en" ? "en-US" : "es-MX";
}

/** Read the user's country from cookie (server-side) */
export async function getServerCountry(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const country = cookieStore.get(COUNTRY_COOKIE_NAME)?.value;
    if (country) return country;
  } catch {
    // cookies() not available outside request context
  }
  return "CO";
}
