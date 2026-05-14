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

    // Decode JWT claims so we can see what PostgREST is actually getting.
    if (accessToken) {
      try {
        const parts = accessToken.split(".");
        const headerJson = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
        const now = Math.floor(Date.now() / 1000);
        console.error(
          `[supabase/server] jwt claims: alg=${headerJson.alg} kid=${headerJson.kid ?? "none"} ` +
            `sub=${payload.sub} role=${payload.role} aud=${payload.aud} ` +
            `iss=${payload.iss} exp_in=${payload.exp - now}s ` +
            `is_anonymous=${payload.is_anonymous} ref=${payload.ref ?? "n/a"}`
        );
      } catch (e) {
        console.error(`[supabase/server] jwt decode failed:`, e);
      }
    }
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

  // Pin the user JWT. Two layers because supabase-js's `_getAccessToken()` can
  // fall back to the anon key when its internal session cache is stale:
  //   1. `client.accessToken` — read by the bound `_getAccessToken()` first.
  //   2. `client.rest.headers.Authorization` — copied into every PostgrestBuilder
  //      via `new Headers(this.headers)` on `.from()`, so `fetchWithAuth`'s
  //      "only set if missing" check preserves our header even if (1) fails
  //      under minification / binding edge cases.
  if (accessToken) {
    (client as unknown as { accessToken: () => Promise<string | null> }).accessToken =
      async () => accessToken;
    const restHeaders = (client as unknown as { rest: { headers: Headers } }).rest?.headers;
    if (restHeaders && typeof restHeaders.set === "function") {
      restHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    // TEMP DIAGNOSTIC — verify both layers stuck, plus log every REST request's
    // outgoing Authorization to find where the anon-key fallback enters.
    if (process.env.NODE_ENV === "production") {
      const l1Fn = (client as unknown as { accessToken?: unknown }).accessToken;
      const l1OK = typeof l1Fn === "function";
      const l2Auth = restHeaders?.get?.("Authorization") ?? null;
      const l2OK = l2Auth === `Bearer ${accessToken}`;
      console.error(
        `[supabase/server] pin verify: layer1=${l1OK} layer2=${l2OK} ` +
          `l2Prefix=${l2Auth ? l2Auth.slice(0, 24) : "MISSING"}`
      );

      // Resolve accessToken eagerly to verify Layer 1 path works
      if (l1OK) {
        try {
          const resolved = await (l1Fn as () => Promise<string | null>)();
          console.error(
            `[supabase/server] layer1 resolve: ${
              resolved === accessToken ? "MATCH" : resolved ? `MISMATCH(len:${resolved.length})` : "NULL"
            }`
          );
        } catch (e) {
          console.error(`[supabase/server] layer1 resolve threw:`, e);
        }
      }

      const rest = (client as unknown as { rest: { fetch: typeof fetch } }).rest;
      const origFetch = rest.fetch;
      rest.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const headers = new Headers(init?.headers);
        const authHeader = headers.get("Authorization") || "MISSING";
        const tag =
          authHeader === `Bearer ${accessToken}`
            ? "USER_JWT"
            : authHeader === `Bearer ${SUPABASE_ANON_KEY}`
              ? "ANON_KEY"
              : authHeader === "MISSING"
                ? "MISSING"
                : "OTHER";
        console.error(
          `[supabase/server] outgoing rest ${init?.method ?? "GET"} ${url} auth=${tag} prefix=${authHeader.slice(0, 24)}`
        );
        const response = await origFetch(input, init);
        if (response.status >= 400) {
          try {
            const clone = response.clone();
            const body = await clone.text();
            console.error(
              `[supabase/server] rest error status=${response.status} body=${body.slice(0, 500)}`
            );
          } catch {
            /* ignore body read errors */
          }
        }
        return response;
      }) as typeof fetch;
    }
  }

  return client;
}
