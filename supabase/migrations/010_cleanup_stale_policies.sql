-- ============================================
-- Migration 010: Remove stale duplicate policies
-- Keeps only the SECURITY DEFINER-based policies
-- added in 008/009. Recursive inline subqueries
-- on collection_members caused performance issues.
-- ============================================

-- collections: redundant owner-only UPDATE left from schema.sql
DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;

-- collection_members: old recursive INSERT from before migration 008
DROP POLICY IF EXISTS "Owner can manage members" ON public.collection_members;

-- collection_members: old recursive SELECT from before migration 008
DROP POLICY IF EXISTS "Members can view shared collections" ON public.collection_members;

-- collection_movies: owner-only SELECT redundant with "if member" policy
DROP POLICY IF EXISTS "Users can view collection movies" ON public.collection_movies;

-- collection_movies: owner-only INSERT redundant with "shared collections" policy
DROP POLICY IF EXISTS "Users can insert collection movies" ON public.collection_movies;
