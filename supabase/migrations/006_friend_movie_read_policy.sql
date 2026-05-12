-- ============================================
-- Migration 006: Allow friends to read each other's movies
-- Fixes: friend profile stats showing 0
-- ============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own movies" ON public.user_movies;

-- New policy: own movies + friends' movies (accepted friendships only)
CREATE POLICY "Users can view own or friend movies"
  ON public.user_movies FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = user_movies.user_id)
        OR (addressee_id = auth.uid() AND requester_id = user_movies.user_id)
      )
    )
  );
