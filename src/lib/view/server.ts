/* ============================================
 * Server-side view-mode helper
 * Reads grid/list preference from cookie
 * ============================================ */

import { cookies } from "next/headers";
import type { ViewMode } from "./types";

const COOKIE_NAME = "dv-view";

export async function getServerView(): Promise<ViewMode> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_NAME)?.value;
    if (value === "list" || value === "grid") return value;
  } catch {
    // cookies() not available outside request context
  }
  return "grid";
}
