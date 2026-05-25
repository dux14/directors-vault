-- Add tier_position column for intra-tier ordering
ALTER TABLE user_movies
ADD COLUMN tier_position integer NOT NULL DEFAULT 0;

-- Backfill: assign positions based on current updated_at ordering within each tier
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, personal_rating
      ORDER BY updated_at DESC
    ) - 1 AS pos
  FROM user_movies
  WHERE personal_rating IS NOT NULL
)
UPDATE user_movies
SET tier_position = ranked.pos
FROM ranked
WHERE user_movies.id = ranked.id;
