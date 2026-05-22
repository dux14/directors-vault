/* ============================================
 * Watchlist Page — Movies marked "want to watch"
 * ============================================ */

import { getUserMovies } from "@/lib/actions";
import { getServerView } from "@/lib/view/server";
import WatchlistClient from "./WatchlistClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiero Ver",
  description: "Tu lista de películas pendientes",
};

const IconClock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default async function WatchlistPage() {
  const [movies, initialView] = await Promise.all([
    getUserMovies("want_to_watch").catch(() => []),
    getServerView(),
  ]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconClock /> Quiero Ver</h1>
          <p>
            {movies.length > 0
              ? `${movies.length} película${movies.length !== 1 ? "s" : ""} en tu lista`
              : "Tu lista de pendientes está vacía"}
          </p>
        </div>

        <WatchlistClient movies={movies} initialView={initialView} />
      </div>
    </div>
  );
}
