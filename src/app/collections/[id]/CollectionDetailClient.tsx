/* ============================================
 * Collection Detail Client
 * Shows movies + members + shared ratings
 * ============================================ */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { removeMovieFromCollection } from "@/lib/actions";
import {
  inviteToCollection,
  type CollectionMember,
} from "@/lib/collection-actions";
import { useTranslation } from "@/lib/i18n/context";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { Collection, CollectionMovie, Friendship } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./collectionDetail.module.css";

/* ---- Icons ---- */
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface MemberRatings {
  [movieId: number]: {
    user_id: string;
    display_name: string | null;
    rating: number | null;
  }[];
}

interface Props {
  collection: Collection;
  initialMovies: CollectionMovie[];
  members: CollectionMember[];
  memberRatings: MemberRatings;
  friends: Friendship[];
  isOwner: boolean;
}

export default function CollectionDetailClient({
  collection,
  initialMovies,
  members,
  memberRatings,
  friends,
  isOwner,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  const isShared = members.length > 0;

  const memberUserIds = new Set(members.map((m) => m.user_id));
  const invitableFriends = friends.filter(
    (f) => f.profile && !memberUserIds.has(f.profile.id)
  );

  const handleInvite = async (friendUserId: string) => {
    setInviting(true);
    try {
      await inviteToCollection(collection.id, friendUserId);
      setShowInvite(false);
      router.refresh();
    } catch (err) {
      console.error("Invite error:", err);
    }
    setInviting(false);
  };

  // Calculate average rating for a movie across all members
  const getAvgRating = (movieId: number): number | null => {
    const ratings = memberRatings[movieId];
    if (!ratings) return null;
    const validRatings = ratings.filter((r) => r.rating !== null);
    if (validRatings.length === 0) return null;
    return (
      validRatings.reduce((sum, r) => sum + (r.rating || 0), 0) /
      validRatings.length
    );
  };

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className={`btn btn-ghost btn-sm ${styles.backBtn}`}
        >
          ← {t("collectionDetail.back")}
        </button>

        <div className="page-header">
          <h1>
            {collection.name}
            {isShared && (
              <span className="tag active" style={{ marginLeft: "var(--space-sm)", fontSize: "0.5em", verticalAlign: "middle" }}>
                <IconUsers /> {t("collectionDetail.shared")}
              </span>
            )}
          </h1>
          {collection.description && <p>{collection.description}</p>}
          <span className="tag" style={{ marginTop: "var(--space-sm)" }}>
            {t(`collections.type.${collection.type}`)}
          </span>
        </div>

        {/* Members Section */}
        {isShared && (
          <section style={{ marginBottom: "var(--space-xl)" }}>
            <h2 className="section-title">
              <IconUsers /> {t("collectionDetail.members")} ({members.length})
            </h2>
            <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
              {members.map((member) => (
                <span
                  key={member.id}
                  className="tag"
                  style={member.role === "owner" ? { borderColor: "var(--accent-primary)" } : {}}
                >
                  {member.profile?.display_name || member.profile?.email || "User"}
                  {member.role === "owner" && (
                    <small style={{ marginLeft: "4px", opacity: 0.7 }}>
                      ({t("collectionDetail.owner")})
                    </small>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Invite Button (owner only) */}
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: "var(--space-lg)" }}
            id="invite-friend-btn"
          >
            <IconPlus /> {t("collectionDetail.invite")}
          </button>
        )}

        {/* Invite Modal */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvite(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-handle" />
                <h3 style={{ marginBottom: "var(--space-md)" }}>
                  {t("collectionDetail.invite")}
                </h3>
                {invitableFriends.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    {invitableFriends.map((friend) => (
                      <button
                        key={friend.id}
                        disabled={inviting}
                        onClick={() =>
                          friend.profile && handleInvite(friend.profile.id)
                        }
                        className="btn btn-secondary"
                        style={{ width: "100%", justifyContent: "flex-start" }}
                      >
                        {friend.profile?.display_name || friend.profile?.email}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", opacity: 0.6 }}>
                    {t("social.noFriends")}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Grid with Ratings */}
        {initialMovies.length > 0 ? (
          <div className="movie-grid">
            {initialMovies.map((movie) => {
              const avg = isShared ? getAvgRating(movie.tmdb_movie_id) : null;
              const avgGrade = avg !== null ? ratingToGrade(Math.round(avg)) : null;
              const avgColor = avg !== null ? getRatingColor(Math.round(avg)) : undefined;
              const movieRatings = isShared ? memberRatings[movie.tmdb_movie_id] : null;

              return (
                <div key={movie.id} style={{ position: "relative" }}>
                  <MovieCard
                    tmdbId={movie.tmdb_movie_id}
                    title={movie.movie_title || `Movie #${movie.tmdb_movie_id}`}
                    posterPath={movie.movie_poster_path || null}
                  />
                  {/* Individual + Avg Ratings for shared collections */}
                  {isShared && movieRatings && (
                    <div className={styles.ratingOverlay}>
                      {movieRatings
                        .filter((r) => r.rating !== null)
                        .map((r) => {
                          const grade = ratingToGrade(r.rating!);
                          const color = getRatingColor(r.rating!);
                          return (
                            <span
                              key={r.user_id}
                              className={styles.memberRating}
                              style={{ color }}
                              title={r.display_name || "User"}
                            >
                              {(r.display_name || "?").charAt(0).toUpperCase()}:{grade}
                            </span>
                          );
                        })}
                      {avgGrade && (
                        <span
                          className={styles.avgRating}
                          style={{ color: avgColor }}
                        >
                          ⌀ {avgGrade}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🎬</div>
            <h3>{t("collectionDetail.empty")}</h3>
            <p>{t("collectionDetail.emptyDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
