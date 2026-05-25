/* ============================================
 * Watchlist Client — grid/list toggle wrapper
 * ============================================ */

"use client";

import { useState } from "react";
import MovieCard from "@/components/MovieCard";
import MovieListRow from "@/components/MovieListRow";
import ViewToggle from "@/components/ViewToggle";
import { useView } from "@/lib/view/client";
import { useTranslation } from "@/lib/i18n/context";
import type { UserMovie, MediaType } from "@/lib/types";
import type { ViewMode } from "@/lib/view/types";

const IconClockEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface Props {
  movies: UserMovie[];
  initialView: ViewMode;
}

export default function WatchlistClient({ movies, initialView }: Props) {
  const [view, setView] = useView(initialView);
  const { t } = useTranslation();
  const [mediaFilter, setMediaFilter] = useState<"all" | MediaType>("all");

  const filtered = mediaFilter === "all"
    ? movies
    : movies.filter(m => m.media_type === mediaFilter);

  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon"><IconClockEmpty /></div>
        <h3>Nada pendiente</h3>
        <p>
          Busca películas y márcalas como &quot;Quiero Ver&quot; para
          agregarlas aquí.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
        <div style={{ display: "flex", gap: "2px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "2px" }}>
          {(["all", "movie", "tv"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaFilter(type)}
              style={{
                padding: "4px 12px",
                border: "none",
                background: mediaFilter === type ? "var(--accent-primary)" : "none",
                color: mediaFilter === type ? "var(--bg-primary)" : "var(--text-secondary)",
                fontSize: "12px",
                fontWeight: mediaFilter === type ? 600 : 400,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              {t(type === "all" ? "filter.all" : type === "movie" ? "filter.movies" : "filter.series")}
            </button>
          ))}
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><IconClockEmpty /></div>
          <h3>{t("filter.all")}</h3>
          <p style={{ opacity: 0.6 }}>
            {t(mediaFilter === "movie" ? "filter.movies" : "filter.series")}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="movie-grid">
          {filtered.map((movie) => (
            <MovieCard
              key={movie.id}
              tmdbId={movie.tmdb_id}
              title={movie.movie_title || `Item #${movie.tmdb_id}`}
              posterPath={movie.movie_poster_path || null}
              releaseDate={movie.movie_release_date}
              status={movie.status}
              mediaType={movie.media_type}
              showBadge={true}
            />
          ))}
        </div>
      ) : (
        <div className="movie-list">
          {filtered.map((movie) => (
            <MovieListRow
              key={movie.id}
              tmdbId={movie.tmdb_id}
              title={movie.movie_title || `Item #${movie.tmdb_id}`}
              posterPath={movie.movie_poster_path || null}
              releaseDate={movie.movie_release_date}
              status={movie.status}
              mediaType={movie.media_type}
              showBadge={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
