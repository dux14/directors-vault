/* ============================================
 * Social Client Component
 * Friend management: search, add, accept, view
 * ============================================ */

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n/context";
import {
  searchUserByEmail,
  searchUserByFriendCode,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "@/lib/social-actions";
import type { UserPublicProfile, Friendship } from "@/lib/types";
import styles from "./social.module.css";

/* ---- SVG Icons ---- */
const IconUsers = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconUserPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

type SearchMode = "email" | "code";

interface Props {
  profile: UserPublicProfile | null;
  friends: Friendship[];
  pendingReceived: Friendship[];
  pendingSent: Friendship[];
}

export default function SocialClient({
  profile,
  friends,
  pendingReceived,
  pendingSent,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("email");
  const [searchResult, setSearchResult] = useState<UserPublicProfile | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  const friendCode = profile?.friend_code?.slice(0, 8) || "—";

  const handleCopyCode = () => {
    if (profile?.friend_code) {
      navigator.clipboard.writeText(profile.friend_code.slice(0, 8));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const result = searchMode === "email"
        ? await searchUserByEmail(searchQuery)
        : await searchUserByFriendCode(searchQuery);

      if (result) {
        setSearchResult(result);
      } else {
        setSearchError(
          searchMode === "email"
            ? t("social.notFoundEmail")
            : t("social.notFoundCode")
        );
      }
    } catch {
      setSearchError(t("social.searchError"));
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    startTransition(async () => {
      try {
        await sendFriendRequest(userId);
        setSearchResult(null);
        setSearchQuery("");
        router.refresh();
      } catch (e: unknown) {
        setSearchError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    startTransition(async () => {
      await respondToFriendRequest(friendshipId, accept);
      router.refresh();
    });
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm(t("social.removeFriend"))) return;
    startTransition(async () => {
      await removeFriend(friendshipId);
      router.refresh();
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconUsers /> {t("social.title")}</h1>
        </div>

        {/* Friend Code Card */}
        <div className={styles.friendCodeCard}>
          <div className={styles.codeSection}>
            <p className={styles.codeLabel}>{t("social.friendCode")}</p>
            <div className={styles.codeDisplay}>
              <span className={styles.code}>{friendCode}</span>
              <button
                onClick={handleCopyCode}
                className={styles.copyBtn}
                title="Copiar"
              >
                {copied ? <IconCheck /> : <IconCopy />}
              </button>
            </div>
            <p className={styles.codeHint}>{t("social.shareTip")}</p>
          </div>
        </div>

        {/* Search for Friends */}
        <section className={styles.section}>
          <h2 className="section-title"><IconUserPlus /> {t("social.addFriend")}</h2>

          <div className={styles.searchTabs}>
            <button
              onClick={() => setSearchMode("email")}
              className={`tag ${searchMode === "email" ? "active" : ""}`}
            >
              {t("social.email")}
            </button>
            <button
              onClick={() => setSearchMode("code")}
              className={`tag ${searchMode === "code" ? "active" : ""}`}
            >
              {t("social.code")}
            </button>
          </div>

          <div className={styles.searchRow}>
            <input
              type={searchMode === "email" ? "email" : "text"}
              placeholder={searchMode === "email" ? t("social.emailPlaceholder") : t("social.codePlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={`input ${styles.searchInput}`}
              id="friend-search-input"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="btn btn-primary"
              id="friend-search-btn"
            >
              <IconSearch />
            </button>
          </div>

          {searchError && (
            <p className={styles.errorMsg}>{searchError}</p>
          )}

          {/* Search Result */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                className={styles.resultCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={styles.resultAvatar}>
                  {searchResult.avatar_url ? (
                    <img src={searchResult.avatar_url} alt="" className={styles.avatarImg} />
                  ) : (
                    <span className={styles.avatarFallback}>
                      {(searchResult.display_name || searchResult.email).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.resultInfo}>
                  <h3 className={styles.resultName}>
                    {searchResult.display_name || searchResult.email}
                  </h3>
                  <p className={styles.resultEmail}>{searchResult.email}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(searchResult.id)}
                  disabled={isPending}
                  className="btn btn-primary btn-sm"
                >
                  <IconUserPlus /> {t("social.add")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Pending Received */}
        {pendingReceived.length > 0 && (
          <section className={styles.section}>
            <h2 className="section-title">
              <IconClock /> {t("social.requests")} ({pendingReceived.length})
            </h2>
            <div className={styles.friendList}>
              {pendingReceived.map((f) => (
                <div key={f.id} className={styles.friendCard}>
                  <div className={styles.friendAvatar}>
                    {f.profile?.avatar_url ? (
                      <img src={f.profile.avatar_url} alt="" className={styles.avatarImg} />
                    ) : (
                      <span className={styles.avatarFallback}>
                        {(f.profile?.display_name || f.profile?.email || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.friendInfo}>
                    <h3>{f.profile?.display_name || f.profile?.email}</h3>
                    <p className={styles.friendEmail}>{f.profile?.email}</p>
                  </div>
                  <div className={styles.friendActions}>
                    <button
                      onClick={() => handleRespond(f.id, true)}
                      disabled={isPending}
                      className={styles.acceptBtn}
                      title="Aceptar"
                    >
                      <IconCheck />
                    </button>
                    <button
                      onClick={() => handleRespond(f.id, false)}
                      disabled={isPending}
                      className={styles.rejectBtn}
                      title="Rechazar"
                    >
                      <IconX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Friends List */}
        <section className={styles.section}>
          <h2 className="section-title">
            <IconUsers /> {t("social.friends")} ({friends.length})
          </h2>
          {friends.length > 0 ? (
            <div className={styles.friendList}>
              {friends.map((f) => (
                <div key={f.id} className={styles.friendCard}>
                  <div className={styles.friendAvatar}>
                    {f.profile?.avatar_url ? (
                      <img src={f.profile.avatar_url} alt="" className={styles.avatarImg} />
                    ) : (
                      <span className={styles.avatarFallback}>
                        {(f.profile?.display_name || f.profile?.email || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.friendInfo}>
                    <Link href={`/social/${f.profile?.id}`} className={styles.friendLink}>
                      <h3>{f.profile?.display_name || f.profile?.email}</h3>
                    </Link>
                    <p className={styles.friendEmail}>{f.profile?.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(f.id)}
                    disabled={isPending}
                    className={styles.removeBtn}
                    title="Eliminar"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon"><IconUsers /></div>
              <h3>{t("social.noFriends")}</h3>
              <p>{t("social.noFriendsDesc")}</p>
            </div>
          )}
        </section>

        {/* Pending Sent */}
        {pendingSent.length > 0 && (
          <section className={styles.section}>
            <h2 className="section-title">{t("social.sent")} ({pendingSent.length})</h2>
            <div className={styles.friendList}>
              {pendingSent.map((f) => (
                <div key={f.id} className={`${styles.friendCard} ${styles.pending}`}>
                  <div className={styles.friendAvatar}>
                    <span className={styles.avatarFallback}>
                      {(f.profile?.display_name || f.profile?.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.friendInfo}>
                    <h3>{f.profile?.display_name || f.profile?.email}</h3>
                    <p className={styles.friendEmail}>{t("social.pendingAccept")}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(f.id)}
                    disabled={isPending}
                    className={styles.removeBtn}
                    title="Cancelar"
                  >
                    <IconX />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
