-- ============================================
-- Migration 011: Re-enable RLS on collections tables
-- Disabled temporarily 2026-05-13 as a workaround for a
-- PostgREST/JWKS issue after the JWT signing keys rotation.
-- The kid was refreshed (ccb4c119-...), so RLS should work again.
-- ============================================

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_members ENABLE ROW LEVEL SECURITY;
