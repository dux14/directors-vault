"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import type { TMDBGenre, TMDBKeyword } from "@/lib/tmdb";
import { searchKeywordsAction } from "@/lib/tmdb-actions";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  genres: TMDBGenre[];
  selectedGenres: number[];
  onGenresChange: (ids: number[]) => void;
  keywords: { id: number; name: string }[];
  onKeywordsChange: (kws: { id: number; name: string }[]) => void;
  mediaType: "all" | "movie" | "tv";
  onMediaTypeChange: (type: "all" | "movie" | "tv") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount?: number;
  onApply: () => void;
  onClear: () => void;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", key: "search.popularity" },
  { value: "vote_average.desc", key: "search.sortRating" },
  { value: "first_air_date.desc", key: "search.newest" },
  { value: "title.asc", key: "search.titleAZ" },
];

export default function FilterPanel({
  open,
  onClose,
  genres,
  selectedGenres,
  onGenresChange,
  keywords,
  onKeywordsChange,
  mediaType,
  onMediaTypeChange,
  sortBy,
  onSortChange,
  resultCount,
  onApply,
  onClear,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [filterSearch, setFilterSearch] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState<TMDBKeyword[]>([]);
  const [showKeywordInput, setShowKeywordInput] = useState(false);

  useEffect(() => {
    if (!keywordInput.trim()) {
      setKeywordSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchKeywordsAction(keywordInput);
      setKeywordSuggestions(res.results.slice(0, 8));
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const toggleGenre = (id: number) => {
    if (selectedGenres.includes(id)) {
      onGenresChange(selectedGenres.filter((g) => g !== id));
    } else {
      onGenresChange([...selectedGenres, id]);
    }
  };

  const addKeyword = (kw: { id: number; name: string }) => {
    if (!keywords.find((k) => k.id === kw.id)) {
      onKeywordsChange([...keywords, kw]);
    }
    setKeywordInput("");
    setKeywordSuggestions([]);
    setShowKeywordInput(false);
  };

  const removeKeyword = (id: number) => {
    onKeywordsChange(keywords.filter((k) => k.id !== id));
  };

  const filteredGenres = filterSearch
    ? genres.filter((g) => g.name.toLowerCase().includes(filterSearch.toLowerCase()))
    : genres;

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle}><div className={styles.handleBar} /></div>

        <div className={styles.panelHeader}>
          <h3>{t("search.filters")}</h3>
          <button onClick={onClear} className={styles.clearBtn}>{t("search.clearAll")}</button>
        </div>

        <div className={styles.panelBody}>
          <input
            type="text"
            placeholder={t("search.searchFilters")}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className={styles.filterSearchInput}
          />

          <div className={styles.section}>
            <label className={styles.sectionLabel}>Tipo</label>
            <div className={styles.segmentedControl}>
              {(["all", "movie", "tv"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onMediaTypeChange(type)}
                  className={`${styles.segmentBtn} ${mediaType === type ? styles.segmentBtnActive : ""}`}
                >
                  {t(type === "all" ? "filter.all" : type === "movie" ? "filter.movies" : "filter.series")}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t("search.genres")}</label>
            <div className={styles.chipGrid}>
              {filteredGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`${styles.chip} ${selectedGenres.includes(genre.id) ? styles.chipActive : ""}`}
                >
                  {genre.name} {selectedGenres.includes(genre.id) && "✓"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t("search.keywords")}</label>
            {keywords.length > 0 && (
              <div className={styles.keywordPills}>
                {keywords.map((kw) => (
                  <span key={kw.id} className={styles.keywordPill}>
                    {kw.name}
                    <button onClick={() => removeKeyword(kw.id)} className={styles.pillRemove}>✕</button>
                  </span>
                ))}
              </div>
            )}
            {showKeywordInput ? (
              <div className={styles.keywordSearch}>
                <input
                  type="text"
                  placeholder={t("search.addKeyword")}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className={styles.filterSearchInput}
                  autoFocus
                />
                {keywordSuggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {keywordSuggestions.map((kw) => (
                      <button
                        key={kw.id}
                        onClick={() => addKeyword(kw)}
                        className={styles.suggestion}
                      >
                        {kw.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowKeywordInput(true)}
                className={styles.addKeywordBtn}
              >
                + {t("search.addKeyword")}
              </button>
            )}
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>{t("search.sortBy")}</label>
            <div className={styles.chipGrid}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`${styles.chip} ${sortBy === opt.value ? styles.chipActive : ""}`}
                >
                  {t(opt.key)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.panelFooter}>
          <button onClick={() => { onApply(); onClose(); }} className={styles.applyBtn}>
            {t("search.applyFilters")}
            {resultCount !== undefined && ` (${resultCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
