/* ============================================
 * RatingSlider — Star/number rating input
 * 0.5 - 10 with 0.5 steps
 * ============================================ */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./RatingSlider.module.css";

interface RatingSliderProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export default function RatingSlider({
  value,
  onChange,
  disabled = false,
}: RatingSliderProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const getColor = (val: number) => {
    if (val >= 8) return "var(--success)";
    if (val >= 6) return "var(--accent)";
    if (val >= 4) return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.display}
        key={displayValue}
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <span
          className={styles.number}
          style={{ color: getColor(displayValue) }}
        >
          {displayValue.toFixed(1)}
        </span>
        <span className={styles.outOf}>/10</span>
      </motion.div>

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const val = Math.round((pct * 9.5 + 0.5) * 2) / 2;
            setHoverValue(Math.max(0.5, Math.min(10, val)));
          }}
          onMouseLeave={() => setHoverValue(null)}
          onTouchEnd={() => setHoverValue(null)}
          disabled={disabled}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, ${getColor(
              value
            )} 0%, ${getColor(value)} ${((value - 0.5) / 9.5) * 100}%, var(--bg-tertiary) ${
              ((value - 0.5) / 9.5) * 100
            }%, var(--bg-tertiary) 100%)`,
          }}
          id="rating-slider"
        />
      </div>

      <div className={styles.labels}>
        <span>0.5</span>
        <span>5.0</span>
        <span>10</span>
      </div>
    </div>
  );
}
