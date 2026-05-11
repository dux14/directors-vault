-- ============================================
-- Migration 005: Fix social RLS for friend search
-- Allow authenticated users to search for other users
-- by email or friend code (needed for adding friends)
-- ============================================

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view public profiles or own" ON public.user_profiles;

-- New policy: authenticated users can search any profile
-- (needed for friend search by email/code)
CREATE POLICY "Authenticated users can view profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Make friend_code shorter (8 chars) and more user-friendly
-- Also regenerate existing codes to be shorter
UPDATE public.user_profiles
SET friend_code = SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)
WHERE LENGTH(friend_code) > 8;

-- Ensure the default for new rows also generates short codes
ALTER TABLE public.user_profiles
  ALTER COLUMN friend_code SET DEFAULT SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8);
