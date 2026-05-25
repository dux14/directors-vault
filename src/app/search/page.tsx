/* ============================================
 * Search Page — TMDB search with tabs
 * Títulos | Personas
 * ============================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  searchMulti,
  searchPerson,
  getTrending,
  getTrendingTv,
  getGenres,
  getTvGenres,
  discoverMovies,
  discoverTv,
  movieToMediaItem,
  tvToMediaItem,
  getProfileUrl,
  type TMDBMovie,
  type TMDBTvShow,
  type TMDBGenre,
  type TMDBPersonSearchResult,
  type MediaItem,
} from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import MovieListRow from "@/components/MovieListRow";
import ViewToggle from "@/components/ViewToggle";
import FilterPanel from "@/components/FilterPanel";
import { useView } from "@/lib/view/client";
import { useTranslation } from "@/lib/i18n/context";
import styles from "./search.module.css";

/* ---- SVG Icons ---- */
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconFilm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSearchEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

type SearchTab = "titles" | "people";

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("titles");
  const [titleResults, setTitleResults] = useState<MediaItem[]>([]);
  const [personResults, setPersonResults] = useState<TMDBPersonSearchResult[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [view, setView] = useView();

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<{ id: number; name: string }[]>([]);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [discoverResults, setDiscoverResults] = useState<MediaItem[]>([]);
  const [isDiscoverMode, setIsDiscoverMode] = useState(false);

  const activeFilterCount = selectedGenres.length + selectedKeywords.length;

  // Load genres based on media type filter
  useEffect(() => {
    const loadGenres = async () => {
      if (mediaTypeFilter === "tv") {
        setGenres(await getTvGenres());
      } else if (mediaTypeFilter === "movie") {
        setGenres(await getGenres());
      } else {
        const [mg, tg] = await Promise.all([getGenres(), getTvGenres()]);
        const merged = [...mg];
        for (const g of tg) {
          if (!merged.find((m) => m.id === g.id)) merged.push(g);
        }
        setGenres(merged);
      }
    };
    loadGenres();
  }, [mediaTypeFilter]);

  // Load trending on mount — merge movies and TV
  useEffect(() => {
    Promise.all([getTrending("day"), getTrendingTv("day")])
      .then(([movies, tv]) => {
        const merged = [
          ...movies.results.map(movieToMediaItem),
          ...tv.results.map(tvToMediaItem),
        ]
          .sort((a, b) => b.voteAverage - a.voteAverage)
          .slice(0, 20);
        setTrending(merged);
      })
      .catch(() => {});
  }, []);

  // Discover execution
  const executeDiscover = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        with_genres: selectedGenres.join(",") || undefined,
        with_keywords: selectedKeywords.map((k) => k.id).join(",") || undefined,
        sort_by: sortBy,
      };

      if (mediaTypeFilter === "movie") {
        const res = await discoverMovies(params);
        setDiscoverResults(res.results.map(movieToMediaItem));
      } else if (mediaTypeFilter === "tv") {
        const res = await discoverTv(params);
        setDiscoverResults(res.results.map(tvToMediaItem));
      } else {
        const [m, tv] = await Promise.all([discoverMovies(params), discoverTv(params)]);
        const merged = [
          ...m.results.map(movieToMediaItem),
          ...tv.results.map(tvToMediaItem),
        ].sort((a, b) => b.voteAverage - a.voteAverage);
        setDiscoverResults(merged);
      }
    } catch {
      setDiscoverResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, selectedKeywords, sortBy, mediaTypeFilter]);

  // Search handler
  const performSearch = useCallback(async (q: string, activeTab: SearchTab) => {
    if (!q.trim()) {
      setTitleResults([]);
      setPersonResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === "titles") {
        const data = await searchMulti(q);
        const items: MediaItem[] = data.results
          .filter(
            (r): r is (TMDBMovie & { media_type: "movie" }) | (TMDBTvShow & { media_type: "tv" }) =>
              r.media_type === "movie" || r.media_type === "tv"
          )
          .map((r) => (r.media_type === "movie" ? movieToMediaItem(r) : tvToMediaItem(r)));
        setTitleResults(items);
      } else {
        const data = await searchPerson(q);
        setPersonResults(data.results);
      }
    } catch {
      setTitleResults([]);
      setPersonResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => performSearch(query, tab), 400);
    return () => clearTimeout(timer);
  }, [query, tab, performSearch]);

  const handleTabChange = (newTab: SearchTab) => {
    setTab(newTab);
    setTitleResults([]);
    setPersonResults([]);
    setIsDiscoverMode(false);
    if (query.trim()) setSearched(false);
  };

  // Determine what results to show for titles tab
  const displayResults = isDiscoverMode ? discoverResults : titleResults;

  return (
    <div className="page">
      <div className="container">
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder={t(tab === "titles" ? "search.placeholder.movies" : "search.placeholder.people")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`input ${styles.searchInput}`}
            autoFocus
            id="search-input"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className={styles.clearBtn}
              id="clear-search"
            >
              <IconX />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => handleTabChange("titles")}
            className={`${styles.tab} ${tab === "titles" ? styles.tabActive : ""}`}
            id="tab-titles"
          >
            <IconFilm /> {t("search.titles")}
          </button>
          <button
            onClick={() => handleTabChange("people")}
            className={`${styles.tab} ${tab === "people" ? styles.tabActive : ""}`}
            id="tab-people"
          >
            <IconUser /> {t("search.tab.people")}
          </button>
        </div>

        {/* Filter row — only on titles tab */}
        {tab === "titles" && (
          <div className={styles.filterRow}>
            <button onClick={() => setFilterOpen(true)} className={styles.filterBtn}>
              ⚙ {t("search.filters")}
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
            <ViewToggle value={view} onChange={setView} />
          </div>
        )}

        {/* Active filter pills */}
        {tab === "titles" && (selectedGenres.length > 0 || selectedKeywords.length > 0) && (
          <div className={styles.activePills}>
            {selectedGenres.map((gid) => {
              const genre = genres.find((g) => g.id === gid);
              return genre ? (
                <span key={gid} className={styles.activeGenrePill}>
                  {genre.name}
                  <button onClick={() => setSelectedGenres((prev) => prev.filter((id) => id !== gid))}>
                    ✕
                  </button>
                </span>
              ) : null;
            })}
            {selectedKeywords.map((kw) => (
              <span key={kw.id} className={styles.activeKeywordPill}>
                {kw.name}
                <button onClick={() => setSelectedKeywords((prev) => prev.filter((k) => k.id !== kw.id))}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results header */}
        {searched && !loading && !isDiscoverMode && (
          <div
            className={styles.resultsHeader}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}
          >
            <h2 className="section-title">
              {tab === "titles"
                ? `${titleResults.length} resultado${titleResults.length !== 1 ? "s" : ""}`
                : `${personResults.length} persona${personResults.length !== 1 ? "s" : ""}`}
            </h2>
          </div>
        )}

        {/* Discover mode header */}
        {isDiscoverMode && !loading && (
          <div
            className={styles.resultsHeader}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}
          >
            <h2 className="section-title">
              {t("search.discover")} — {discoverResults.length} resultado{discoverResults.length !== 1 ? "s" : ""}
            </h2>
          </div>
        )}

        {/* Trending (only when not searching, not in discover mode, on titles tab) */}
        {!searched && !isDiscoverMode && tab === "titles" && trending.length > 0 && (
          <>
            <div
              className={styles.resultsHeader}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}
            >
              <h2 className="section-title">
                <IconFlame /> {t("search.popularToday")}
              </h2>
            </div>
            {view === "grid" ? (
              <div className="movie-grid">
                {trending.map((item) => (
                  <MovieCard
                    key={`${item.mediaType}-${item.id}`}
                    tmdbId={item.id}
                    title={item.displayTitle}
                    posterPath={item.posterPath}
                    releaseDate={item.displayDate}
                    rating={item.voteAverage}
                    mediaType={item.mediaType}
                    showBadge={true}
                  />
                ))}
              </div>
            ) : (
              <div className="movie-list">
                {trending.map((item) => (
                  <MovieListRow
                    key={`${item.mediaType}-${item.id}`}
                    tmdbId={item.id}
                    title={item.displayTitle}
                    posterPath={item.posterPath}
                    releaseDate={item.displayDate}
                    mediaType={item.mediaType}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Loading state */}
        {loading && (
          <div className="movie-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3" }} />
              </div>
            ))}
          </div>
        )}

        {/* Title results (search or discover) */}
        {!loading && (searched || isDiscoverMode) && tab === "titles" && displayResults.length > 0 && (
          view === "grid" ? (
            <div className="movie-grid">
              {displayResults.map((item) => (
                <MovieCard
                  key={`${item.mediaType}-${item.id}`}
                  tmdbId={item.id}
                  title={item.displayTitle}
                  posterPath={item.posterPath}
                  releaseDate={item.displayDate}
                  rating={item.voteAverage}
                  mediaType={item.mediaType}
                  showBadge={true}
                />
              ))}
            </div>
          ) : (
            <div className="movie-list">
              {displayResults.map((item) => (
                <MovieListRow
                  key={`${item.mediaType}-${item.id}`}
                  tmdbId={item.id}
                  title={item.displayTitle}
                  posterPath={item.posterPath}
                  releaseDate={item.displayDate}
                  mediaType={item.mediaType}
                />
              ))}
            </div>
          )
        )}

        {/* Person results */}
        {!loading && searched && tab === "people" && personResults.length > 0 && (
          <div className={styles.personGrid}>
            {personResults.map((person) => (
              <Link
                key={person.id}
                href={`/person/${person.id}`}
                className={styles.personCard}
              >
                <div className={styles.personAvatar}>
                  <Image
                    src={getProfileUrl(person.profile_path, "medium")}
                    alt={person.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                    unoptimized={!person.profile_path}
                  />
                </div>
                <div className={styles.personInfo}>
                  <h3 className={styles.personName}>{person.name}</h3>
                  <p className={styles.personDept}>{person.known_for_department}</p>
                  {person.known_for && person.known_for.length > 0 && (
                    <p className={styles.personKnownFor}>
                      {person.known_for
                        .slice(0, 3)
                        .map((m) => m.title)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading &&
          searched &&
          !isDiscoverMode &&
          ((tab === "titles" && titleResults.length === 0) ||
            (tab === "people" && personResults.length === 0)) && (
          <div className="empty-state">
            <div className="icon">
              <IconSearchEmpty />
            </div>
            <h3>{t("search.noResults")}</h3>
            <p>
              {t("search.noResultsFor", {
                type: t(tab === "titles" ? "search.movies" : "search.persons"),
                query,
              })}
            </p>
          </div>
        )}

        {/* FilterPanel */}
        <FilterPanel
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          genres={genres}
          selectedGenres={selectedGenres}
          onGenresChange={setSelectedGenres}
          keywords={selectedKeywords}
          onKeywordsChange={setSelectedKeywords}
          mediaType={mediaTypeFilter}
          onMediaTypeChange={setMediaTypeFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onApply={() => {
            setQuery("");
            setIsDiscoverMode(true);
            setSearched(false);
            executeDiscover();
          }}
          onClear={() => {
            setSelectedGenres([]);
            setSelectedKeywords([]);
            setMediaTypeFilter("all");
            setSortBy("popularity.desc");
            setIsDiscoverMode(false);
            setDiscoverResults([]);
          }}
        />
      </div>
    </div>
  );
}
