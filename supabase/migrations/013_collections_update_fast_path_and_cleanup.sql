-- ============================================
-- Migration 013: Owner fast-path on collections UPDATE policy + diag cleanup
--
-- Same root cause as migration 012: a SECURITY DEFINER function used in an
-- RLS policy USING clause cannot reliably see the just-affected row when
-- the policy is evaluated against an UPDATE...RETURNING (or any RETURNING
-- driven by `.update().select()` in supabase-js). The check_collection_owner
-- function does an internal sub-SELECT against public.collections that
-- returns FALSE for the row being modified in the same transaction, so the
-- whole UPDATE fails with 42501 even when the caller is the owner.
--
-- Fix: short-circuit with `user_id = auth.uid()` (direct row check, no
-- sub-SELECT) before delegating to check_collection_owner for the
-- collection_members 'owner' role case.
--
-- Also drops `public.get_my_uid()`, a temporary RPC added during the debug
-- session to verify auth.uid() inside PostgREST. No longer needed.
-- ============================================

DROP POLICY IF EXISTS "Users can update own or shared collections" ON public.collections;

CREATE POLICY "Users can update own or shared collections"
  ON public.collections FOR UPDATE
  USING (
    user_id = auth.uid()
    OR check_collection_owner(id)
  );

DROP FUNCTION IF EXISTS public.get_my_uid();
