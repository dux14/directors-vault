/* ============================================
 * Rating Scale — Letter Grades
 * S (best) → F (worst), mapped to DB values 1–8
 * DB values preserve natural ORDER BY DESC
 * ============================================ */

export type RatingGrade = "S" | "A+" | "A" | "B" | "C" | "D" | "E" | "F";

export interface RatingDefinition {
  grade: RatingGrade;
  dbValue: number;
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
}

/** Full rating scale, ordered best → worst */
export const RATING_SCALE: RatingDefinition[] = [
  {
    grade: "S",
    dbValue: 8,
    label: "Obra maestra",
    labelEn: "Masterpiece",
    color: "#ffd700",
    bgColor: "rgba(255, 215, 0, 0.15)",
  },
  {
    grade: "A+",
    dbValue: 7,
    label: "Excelente",
    labelEn: "Excellent",
    color: "#4ade80",
    bgColor: "rgba(74, 222, 128, 0.15)",
  },
  {
    grade: "A",
    dbValue: 6,
    label: "Muy buena",
    labelEn: "Very Good",
    color: "#34d399",
    bgColor: "rgba(52, 211, 153, 0.15)",
  },
  {
    grade: "B",
    dbValue: 5,
    label: "Buena",
    labelEn: "Good",
    color: "#60a5fa",
    bgColor: "rgba(96, 165, 250, 0.15)",
  },
  {
    grade: "C",
    dbValue: 4,
    label: "Regular",
    labelEn: "Average",
    color: "#d4a843",
    bgColor: "rgba(212, 168, 67, 0.15)",
  },
  {
    grade: "D",
    dbValue: 3,
    label: "Mediocre",
    labelEn: "Below Average",
    color: "#f0a030",
    bgColor: "rgba(240, 160, 48, 0.15)",
  },
  {
    grade: "E",
    dbValue: 2,
    label: "Mala",
    labelEn: "Bad",
    color: "#fb923c",
    bgColor: "rgba(251, 146, 60, 0.15)",
  },
  {
    grade: "F",
    dbValue: 1,
    label: "Terrible",
    labelEn: "Terrible",
    color: "#f87171",
    bgColor: "rgba(248, 113, 113, 0.15)",
  },
];

/** Convert a DB numeric value (1–8) to a letter grade */
export function ratingToGrade(dbValue: number | null): RatingGrade | null {
  if (dbValue === null || dbValue === undefined) return null;
  const def = RATING_SCALE.find((r) => r.dbValue === dbValue);
  return def?.grade ?? null;
}

/** Convert a letter grade to the DB numeric value */
export function gradeToRating(grade: RatingGrade): number {
  const def = RATING_SCALE.find((r) => r.grade === grade);
  if (!def) throw new Error(`Invalid grade: ${grade}`);
  return def.dbValue;
}

/** Get the full definition for a DB value */
export function getRatingDef(dbValue: number | null): RatingDefinition | null {
  if (dbValue === null || dbValue === undefined) return null;
  return RATING_SCALE.find((r) => r.dbValue === dbValue) ?? null;
}

/** Get the color for a rating DB value */
export function getRatingColor(dbValue: number | null): string {
  const def = getRatingDef(dbValue);
  return def?.color ?? "var(--text-tertiary)";
}

/**
 * Convert old numeric ratings (0.5–10) to new DB values (1–8)
 * Used for migration only
 */
export function migrateOldRating(oldRating: number): number {
  if (oldRating >= 10.0) return 8; // S
  if (oldRating >= 8.5) return 7; // A+
  if (oldRating >= 7.5) return 6; // A
  if (oldRating >= 6.0) return 5; // B
  if (oldRating >= 4.5) return 4; // C
  if (oldRating >= 3.0) return 3; // D
  if (oldRating >= 1.5) return 2; // E
  return 1; // F
}
