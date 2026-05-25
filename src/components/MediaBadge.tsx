"use client";

import type { MediaType } from "@/lib/types";
import styles from "./MediaBadge.module.css";

export default function MediaBadge({ type }: { type: MediaType }) {
  return (
    <span className={`${styles.badge} ${styles[type]}`}>
      {type === "movie" ? "MOVIE" : "TV"}
    </span>
  );
}
