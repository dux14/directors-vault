/* ============================================
 * Feature Flags
 * Control beta features via env vars
 * ============================================ */

const FLAGS = {
  RECOMMENDER: process.env.NEXT_PUBLIC_FF_RECOMMENDER === "true",
  SOCIAL: process.env.NEXT_PUBLIC_FF_SOCIAL === "true",
} as const;

export type FeatureFlag = keyof typeof FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAGS[flag] ?? false;
}

export default FLAGS;
