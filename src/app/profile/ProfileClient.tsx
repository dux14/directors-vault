/* ============================================
 * Profile Client Component
 * ============================================ */

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import styles from "./profile.module.css";

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

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>👤 Mi Perfil</h1>
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
            <span className={styles.statValue}>{stats.watched}</span>
            <span className={styles.statLabel}>Vistas</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.watchlist}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
            </span>
            <span className={styles.statLabel}>Promedio ⭐</span>
          </div>
          <div className={styles.statCard}>
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
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
