/* ============================================
 * Collection Detail Client
 * Shows movies + members + shared ratings
 * ============================================ */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import MovieListRow from "@/components/MovieListRow";
import ViewToggle from "@/components/ViewToggle";
import { removeMovieFromCollection, updateCollection, deleteCollection } from "@/lib/actions";
import {
  inviteToCollection,
  type CollectionMember,
} from "@/lib/collection-actions";
import { useTranslation } from "@/lib/i18n/context";
import { useView } from "@/lib/view/client";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { Collection, CollectionMovie, Friendship, CollectionType, MediaType } from "@/lib/types";
import type { ViewMode } from "@/lib/view/types";
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

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconXSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCheckSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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
  currentUserId: string;
  watchedIds: number[];
  initialView?: ViewMode;
}

export default function CollectionDetailClient({
  collection,
  initialMovies,
  members,
  memberRatings,
  friends,
  isOwner,
  currentUserId,
  watchedIds,
  initialView = "grid",
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editType, setEditType] = useState<CollectionType>(collection.type);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditingMovies, setIsEditingMovies] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [view, setView] = useView(initialView);
  const [mediaFilter, setMediaFilter] = useState<"all" | MediaType>("all");

  const hasMovies = initialMovies.some(m => m.media_type === "movie");
  const hasTv = initialMovies.some(m => m.media_type === "tv");
  const showMediaFilter = hasMovies && hasTv;

  const filteredMovies = mediaFilter === "all"
    ? initialMovies
    : initialMovies.filter(m => m.media_type === mediaFilter);

  const isShared = members.length > 0;
  const isMember = members.some((m) => m.user_id === currentUserId);
  const canEdit = isOwner || isMember;
  const canDelete = isOwner;
  const watchedSet = new Set(watchedIds);

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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateCollection(collection.id, { name: editName.trim(), type: editType });
      setShowEdit(false);
      router.refresh();
    } catch (err) {
      console.error("Edit error:", err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("collectionDetail.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await deleteCollection(collection.id);
      router.push("/collections");
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);
    }
  };

  const handleMovieClickToRemove = async (tmdbMovieId: number, mediaType: MediaType) => {
    if (removing) return;
    if (pendingRemoval !== tmdbMovieId) {
      setPendingRemoval(tmdbMovieId);
      return;
    }
    setRemoving(true);
    try {
      await removeMovieFromCollection(collection.id, tmdbMovieId, mediaType);
      setPendingRemoval(null);
      router.refresh();
    } catch (err) {
      console.error("Remove movie error:", err);
    }
    setRemoving(false);
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <h1 style={{ margin: 0 }}>
              {collection.name}
              {isShared && (
                <span className="tag active" style={{ marginLeft: "var(--space-sm)", fontSize: "0.5em", verticalAlign: "middle" }}>
                  <IconUsers /> {t("collectionDetail.shared")}
                </span>
              )}
            </h1>
            {(canEdit || canDelete) && (
              <div style={{ display: "flex", gap: "var(--space-xs)", flexShrink: 0 }}>
                {canEdit && (
                  <button
                    onClick={() => { setEditName(collection.name); setEditType(collection.type); setShowEdit(true); }}
                    className="btn btn-ghost btn-icon btn-sm"
                    title={t("collectionDetail.edit")}
                    id="edit-collection-btn"
                  >
                    <IconEdit />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn btn-ghost btn-icon btn-sm"
                    title={t("general.delete")}
                    id="delete-collection-btn"
                    style={{ color: "var(--danger)" }}
                  >
                    <IconTrash />
                  </button>
                )}
              </div>
            )}
          </div>
          {collection.description && <p>{collection.description}</p>}
          <span className="tag" style={{ marginTop: "var(--space-sm)" }}>
            {t(`collections.type.${collection.type}`)}
          </span>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEdit && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEdit(false)}
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
                <h3 style={{ marginBottom: "var(--space-lg)" }}>
                  {t("collectionDetail.editTitle")}
                </h3>
                <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input"
                    required
                    autoFocus
                    id="edit-collection-name"
                  />
                  <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
                    {(["custom", "saga", "director", "actor", "genre"] as CollectionType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditType(type)}
                        className={`tag ${editType === type ? "active" : ""}`}
                      >
                        {t(`collections.type.${type}`)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setShowEdit(false)} className="btn btn-ghost">
                      {t("general.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !editName.trim()}
                      className="btn btn-primary"
                      id="save-edit-collection-btn"
                    >
                      {saving ? t("collectionDetail.saving") : t("general.save")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {initialMovies.length > 0 && (
          <div className={styles.editMoviesBar} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            {canEdit ? (
              <button
                onClick={() => {
                  setIsEditingMovies((prev) => !prev);
                  setPendingRemoval(null);
                }}
                className={`btn ${isEditingMovies ? "btn-primary" : "btn-ghost"} btn-sm`}
                id="toggle-edit-movies-btn"
              >
                {isEditingMovies
                  ? t("collectionDetail.doneEditing")
                  : t("collectionDetail.editMovies")}
              </button>
            ) : <span />}
            {!isEditingMovies && (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                {showMediaFilter && (
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
                )}
                <ViewToggle value={view} onChange={setView} />
              </div>
            )}
          </div>
        )}

        {/* Movies — list view (skipped when editing to keep remove UX simple) */}
        {initialMovies.length > 0 && filteredMovies.length > 0 && view === "list" && !isEditingMovies ? (
          <div className="movie-list">
            {filteredMovies.map((movie) => (
              <MovieListRow
                key={movie.id}
                tmdbId={movie.tmdb_id}
                title={movie.movie_title || `Movie #${movie.tmdb_id}`}
                posterPath={movie.movie_poster_path || null}
                watched={watchedSet.has(movie.tmdb_id)}
                mediaType={movie.media_type}
                showBadge={showMediaFilter}
              />
            ))}
          </div>
        ) : initialMovies.length > 0 && filteredMovies.length > 0 ? (
          <div className="movie-grid">
            {filteredMovies.map((movie) => {
              const avg = isShared ? getAvgRating(movie.tmdb_id) : null;
              const avgGrade = avg !== null ? ratingToGrade(Math.round(avg)) : null;
              const avgColor = avg !== null ? getRatingColor(Math.round(avg)) : undefined;
              const movieRatings = isShared ? memberRatings[movie.tmdb_id] : null;
              const isPending = pendingRemoval === movie.tmdb_id;

              return (
                <div
                  key={movie.id}
                  className={`${styles.movieCell} ${isEditingMovies ? styles.editing : ""} ${isPending ? styles.pendingRemoval : ""}`}
                >
                  <MovieCard
                    tmdbId={movie.tmdb_id}
                    title={movie.movie_title || `Movie #${movie.tmdb_id}`}
                    posterPath={movie.movie_poster_path || null}
                    watched={watchedSet.has(movie.tmdb_id)}
                    mediaType={movie.media_type}
                    showBadge={showMediaFilter}
                  />

                  {isEditingMovies && canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMovieClickToRemove(movie.tmdb_id, movie.media_type);
                      }}
                      disabled={removing}
                      className={styles.removeButton}
                      title={
                        isPending
                          ? t("collectionDetail.confirmRemove")
                          : t("collectionDetail.removeMovie")
                      }
                      aria-label={t("collectionDetail.removeMovie")}
                    >
                      {isPending ? <IconCheckSmall /> : <IconXSmall />}
                    </button>
                  )}

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
        ) : initialMovies.length > 0 ? (
          <div className="empty-state">
            <h3 style={{ opacity: 0.6 }}>{t(mediaFilter === "movie" ? "filter.movies" : "filter.series")}</h3>
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
