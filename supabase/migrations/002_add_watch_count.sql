-- ============================================
-- Migration 002: Add watch count column
-- Tracks how many times a user has watched a movie
-- ============================================

ALTER TABLE public.user_movies
  ADD COLUMN IF NOT EXISTS watch_count integer DEFAULT 0 NOT NULL;

-- Set watch_count = 1 for all existing watched movies
UPDATE public.user_movies
SET watch_count = 1
WHERE status = 'watched' AND watch_count = 0;
