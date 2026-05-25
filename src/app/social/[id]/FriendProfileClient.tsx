/* ============================================
 * Friend Profile Client
 * Shows a friend's stats + top movies
 * ============================================ */

"use client";

import { useRouter } from "next/navigation";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import { useTranslation } from "@/lib/i18n/context";
import MovieCard from "@/components/MovieCard";
import type { UserPublicProfile, MediaType } from "@/lib/types";
import styles from "./friendProfile.module.css";

/* ---- SVG Icons ---- */
const IconChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: "var(--accent-primary)" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

interface Props {
  profile: UserPublicProfile;
  stats: {
    watched: number;
    avgRating: number;
    topItems: { tmdb_id: number; media_type: string; personal_rating: number }[];
    topItemDetails: { tmdb_id: number; media_type: string; title: string; poster_path: string | null; rating: number }[];
  };
}

export default function FriendProfileClient({ profile, stats }: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  const avgGrade = stats.avgRating > 0
    ? ratingToGrade(Math.round(stats.avgRating))
    : null;
  const avgColor = stats.avgRating > 0
    ? getRatingColor(Math.round(stats.avgRating))
    : undefined;

  return (
    <div className="page">
      <div className="container">
        <button
          onClick={() => router.back()}
          className={`btn btn-ghost btn-icon ${styles.backBtn}`}
        >
          <IconChevronLeft />
        </button>

        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarFallback}>
                {(profile.display_name || profile.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className={styles.name}>{profile.display_name || profile.email}</h1>
          <p className={styles.email}>{profile.email}</p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <IconEye />
            <span className={styles.statValue}>{stats.watched}</span>
            <span className={styles.statLabel}>{t("social.watched")}</span>
          </div>
          <div className={styles.statCard}>
            <IconStar />
            <span className={styles.statValue} style={{ color: avgColor }}>
              {avgGrade || "—"}
            </span>
            <span className={styles.statLabel}>{t("social.average")}</span>
          </div>
        </div>

        {/* Top Items */}
        {stats.topItemDetails.length > 0 && (
          <section className={styles.section}>
            <h2 className="section-title"><IconTrophy /> {t("social.topMovies")}</h2>
            <div className="movie-grid">
              {stats.topItemDetails.map((item) => (
                <MovieCard
                  key={item.tmdb_id}
                  tmdbId={item.tmdb_id}
                  title={item.title}
                  posterPath={item.poster_path}
                  userRating={item.rating}
                  mediaType={item.media_type as MediaType}
                  showBadge={true}
                  size="small"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
