-- ============================================
-- Migration 014: Self fast-path on collection_members SELECT policy
--
-- Same root cause as migrations 012/013, now on a different table.
-- respondToInvitation in src/lib/collection-actions.ts calls
-- `.from("collection_members").upsert(...)` to add the accepting user as a
-- member. supabase-js / PostgREST emits `INSERT ... ON CONFLICT DO UPDATE
-- ... RETURNING *`, and the RETURNING triggers the SELECT policy
-- `USING (check_collection_access(collection_id))` on the just-inserted
-- row. The SECURITY DEFINER function's internal sub-SELECT against
-- collection_members cannot see the new row in the same transaction, so it
-- returns FALSE and the upsert fails with 42501. The error was swallowed
-- because the action did not check it — invitations were marked "accepted"
-- but no membership row was ever created, so the shared collection
-- disappeared from the invitee's /collections page.
--
-- Fix: short-circuit on `user_id = auth.uid()` (a direct row-level check,
-- no sub-SELECT) before delegating to check_collection_access. Users can
-- always see their own membership row; the function is still consulted for
-- the legitimate use case of listing OTHER members of a shared collection.
-- ============================================

DROP POLICY IF EXISTS "Members can view collection members" ON public.collection_members;

CREATE POLICY "Members can view collection members"
  ON public.collection_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR check_collection_access(collection_id)
  );
