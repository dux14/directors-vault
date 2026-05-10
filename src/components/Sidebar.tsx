/* ============================================
 * Desktop Sidebar Navigation
 * Only visible on md+ screens
 * ============================================ */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const navItems = [
  {
    href: "/",
    label: "Mi Ranking",
    icon: "⭐",
  },
  {
    href: "/search",
    label: "Buscar Películas",
    icon: "🔍",
  },
  {
    href: "/watchlist",
    label: "Quiero Ver",
    icon: "⏳",
  },
  {
    href: "/collections",
    label: "Colecciones",
    icon: "📁",
  },
  {
    href: "/profile",
    label: "Mi Perfil",
    icon: "👤",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <aside className={styles.sidebar} id="desktop-sidebar">
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🎬</span>
        <span className={styles.logoText}>DV</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.itemIcon}>{item.icon}</span>
              <span className={styles.itemLabel}>{item.label}</span>
              {isActive && <span className={styles.activeBar} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <p className={styles.footerText}>Director&apos;s Vault<br/>Tu bóveda de cine</p>
      </div>
    </aside>
  );
}
