-- ============================================
-- Migration 012: Owner fast-path on collections SELECT policy
--
-- The previous policy USING (check_collection_access(id)) relied solely on a
-- SECURITY DEFINER function that runs a sub-SELECT against public.collections.
-- When the policy is evaluated against an INSERT...RETURNING row in the same
-- transaction, that inner sub-SELECT does not reliably see the just-inserted
-- row, so the function returns FALSE and the entire operation fails with
-- "new row violates row-level security policy" (SQLSTATE 42501) — even for
-- the legitimate owner doing `.insert().select()` via supabase-js.
--
-- Fix: short-circuit on `user_id = auth.uid()` (direct row check, no
-- sub-SELECT) before delegating to check_collection_access for the member
-- case. Owners can read their own rows via the fast path; members keep using
-- the SECURITY DEFINER function which still avoids the recursion against
-- collection_members.
-- ============================================

DROP POLICY IF EXISTS "Users can view own or shared collections" ON public.collections;

CREATE POLICY "Users can view own or shared collections"
  ON public.collections FOR SELECT
  USING (
    user_id = auth.uid()
    OR check_collection_access(id)
  );
