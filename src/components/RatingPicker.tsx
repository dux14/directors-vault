/* ============================================
 * RatingPicker — Letter grade selector
 * S, A+, A, B, C, D, E, F
 * ============================================ */

"use client";

import { motion } from "framer-motion";
import { RATING_SCALE, type RatingGrade } from "@/lib/ratings";
import styles from "./RatingPicker.module.css";

interface RatingPickerProps {
  value: number | null;
  onChange: (dbValue: number) => void;
  disabled?: boolean;
}

export default function RatingPicker({
  value,
  onChange,
  disabled = false,
}: RatingPickerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {RATING_SCALE.map((rating) => {
          const isSelected = value === rating.dbValue;

          return (
            <motion.button
              key={rating.grade}
              type="button"
              className={`${styles.gradeBtn} ${isSelected ? styles.selected : ""}`}
              style={{
                "--grade-color": rating.color,
                "--grade-bg": rating.bgColor,
              } as React.CSSProperties}
              onClick={() => !disabled && onChange(rating.dbValue)}
              disabled={disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
              animate={isSelected ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              id={`grade-${rating.grade.replace("+", "plus")}`}
            >
              <span className={styles.gradeLetter}>{rating.grade}</span>
              <span className={styles.gradeLabel}>{rating.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
