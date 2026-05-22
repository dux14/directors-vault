/* ============================================
 * ViewToggle — grid / list segmented control
 * ============================================ */

"use client";

import type { ViewMode } from "@/lib/view/types";
import styles from "./ViewToggle.module.css";

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
  gridLabel?: string;
  listLabel?: string;
}

export default function ViewToggle({ value, onChange, gridLabel = "Grid view", listLabel = "List view" }: Props) {
  return (
    <div className={styles.wrapper} role="group" aria-label="View mode">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`${styles.option} ${value === "grid" ? styles.optionActive : ""}`}
        aria-pressed={value === "grid"}
        aria-label={gridLabel}
        title={gridLabel}
      >
        <IconGrid />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`${styles.option} ${value === "list" ? styles.optionActive : ""}`}
        aria-pressed={value === "list"}
        aria-label={listLabel}
        title={listLabel}
      >
        <IconList />
      </button>
    </div>
  );
}
