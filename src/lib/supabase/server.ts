/* ============================================
 * Supabase Client — Server
 * Used in Server Components, Route Handlers, Server Actions
 * ============================================ */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1] ?? "";
const AUTH_COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`;
const BASE64_PREFIX = "base64-";

interface RawCookie {
  name: string;
  value: string;
}

/**
 * Read the access_token from the Supabase auth cookie directly.
 *
 * Why: in production, after a server-action token refresh, supabase-js's
 * internal `getSession()` can return null even though `getUser()` works.
 * `_getAccessToken()` then falls back to the anon key, so PostgREST sees
 * `auth.uid() = NULL` and RLS rejects the insert with 403.
 *
 * Pulling the JWT straight from the cookie and pinning it as
 * `global.headers.Authorization` makes the client send the right token
 * regardless of the auth client's session-cache state.
 */
function extractAccessToken(allCookies: RawCookie[]): string | null {
  const chunks = allCookies.filter(
    (c) => c.name === AUTH_COOKIE_NAME || c.name.startsWith(`${AUTH_COOKIE_NAME}.`)
  );
  if (chunks.length === 0) return null;

  chunks.sort((a, b) => {
    const aIdx = a.name === AUTH_COOKIE_NAME ? -1 : parseInt(a.name.split(".").pop() ?? "0", 10);
    const bIdx = b.name === AUTH_COOKIE_NAME ? -1 : parseInt(b.name.split(".").pop() ?? "0", 10);
    return aIdx - bIdx;
  });

  let raw = chunks.map((c) => c.value).join("");

  if (raw.startsWith(BASE64_PREFIX)) {
    try {
      raw = Buffer.from(raw.slice(BASE64_PREFIX.length), "base64url").toString("utf-8");
    } catch {
      return null;
    }
  }

  try {
    const session = JSON.parse(raw);
    return typeof session?.access_token === "string" ? session.access_token : null;
  } catch {
    return null;
  }
}

export async function createClient() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const accessToken = extractAccessToken(allCookies);

  // TEMP DIAGNOSTIC — remove once 403 RLS bug is confirmed fixed.
  if (process.env.NODE_ENV === "production") {
    const sbCookies = allCookies.filter((c) => c.name.startsWith("sb-"));
    console.error(
      `[supabase/server] jwt=${accessToken ? `len:${accessToken.length}` : "NULL"}` +
        ` cookieName=${AUTH_COOKIE_NAME} sbCookies=${JSON.stringify(
          sbCookies.map((c) => ({ name: c.name, valLen: c.value.length, prefix: c.value.slice(0, 10) }))
        )}`
    );
  }

  const client = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });

  // Pin the user JWT on the client's internal `_getAccessToken()` hook.
  // Setting `accessToken` AFTER createServerClient avoids supabase-js's "throwing
  // auth Proxy" path (it only triggers when `accessToken` is passed via options),
  // so `supabase.auth.getUser()` keeps working while every PostgREST request
  // carries the real user JWT instead of falling back to the anon key.
  if (accessToken) {
    (client as unknown as { accessToken: () => Promise<string | null> }).accessToken =
      async () => accessToken;
  }

  // TEMP DIAGNOSTIC — wrap rest.fetch to log outgoing Authorization header.
  if (process.env.NODE_ENV === "production" && accessToken) {
    const rest = (client as unknown as { rest: { fetch: typeof fetch } }).rest;
    const origFetch = rest.fetch;
    rest.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const headers = new Headers(init?.headers);
      const authHeader = headers.get("Authorization") || "MISSING";
      const authPrefix = authHeader.slice(0, 20);
      const authMatchesExpected = authHeader === `Bearer ${accessToken}`;
      console.error(
        `[supabase/server] outgoing rest: url=${url} authPrefix=${authPrefix} matchesExpected=${authMatchesExpected}`
      );
      return origFetch(input, init);
    }) as typeof fetch;
  }

  return client;
}
