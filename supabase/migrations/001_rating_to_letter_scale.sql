-- ============================================
-- Migration 001: Rating scale from 0.5-10 to letter grades (1-8)
-- S=8, A+=7, A=6, B=5, C=4, D=3, E=2, F=1
-- ============================================

-- Step 1: Convert existing ratings to new scale
UPDATE public.user_movies
SET personal_rating = CASE
  WHEN personal_rating >= 10.0 THEN 8  -- S
  WHEN personal_rating >= 8.5 THEN 7   -- A+
  WHEN personal_rating >= 7.5 THEN 6   -- A
  WHEN personal_rating >= 6.0 THEN 5   -- B
  WHEN personal_rating >= 4.5 THEN 4   -- C
  WHEN personal_rating >= 3.0 THEN 3   -- D
  WHEN personal_rating >= 1.5 THEN 2   -- E
  ELSE 1                                -- F
END
WHERE personal_rating IS NOT NULL;

-- Step 2: Drop old constraint and add new one
ALTER TABLE public.user_movies
  DROP CONSTRAINT IF EXISTS user_movies_personal_rating_check;

ALTER TABLE public.user_movies
  ADD CONSTRAINT user_movies_personal_rating_check
  CHECK (personal_rating IS NULL OR (personal_rating >= 1 AND personal_rating <= 8));

-- Step 3: Change column type to integer (cleaner for grade values)
ALTER TABLE public.user_movies
  ALTER COLUMN personal_rating TYPE integer USING personal_rating::integer;
