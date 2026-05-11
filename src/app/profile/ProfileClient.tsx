/* ============================================
 * Profile Client Component
 * ============================================ */

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ratingToGrade, getRatingColor } from "@/lib/ratings";
import type { User } from "@supabase/supabase-js";
import styles from "./profile.module.css";

/* ---- SVG Icons ---- */
const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: "var(--accent-primary)" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconXCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

interface Props {
  user: User | null;
  stats: {
    watched: number;
    watchlist: number;
    notInterested: number;
    avgRating: number;
  };
}

export default function ProfileClient({ user, stats }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Convert average rating to letter grade
  const avgGrade = stats.avgRating > 0
    ? ratingToGrade(Math.round(stats.avgRating))
    : null;
  const avgColor = stats.avgRating > 0
    ? getRatingColor(Math.round(stats.avgRating))
    : undefined;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><IconUser /> Mi Perfil</h1>
        </div>

        {/* User Info */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className={styles.avatarImg}
              />
            ) : (
              <span className={styles.avatarFallback}>
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>
              {user?.user_metadata?.full_name || user?.email || "Usuario"}
            </h2>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><IconEye /></span>
            <span className={styles.statValue}>{stats.watched}</span>
            <span className={styles.statLabel}>Vistas</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><IconClock /></span>
            <span className={styles.statValue}>{stats.watchlist}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><IconStar /></span>
            <span className={styles.statValue} style={{ color: avgColor }}>
              {avgGrade || "—"}
            </span>
            <span className={styles.statLabel}>Promedio</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><IconXCircle /></span>
            <span className={styles.statValue}>{stats.notInterested}</span>
            <span className={styles.statLabel}>No interesadas</span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={`btn btn-secondary ${styles.signOutBtn}`}
          id="sign-out-btn"
        >
          <IconLogOut /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
