-- ============================================
-- Migration 016: Member collaboration policies
--
-- Extends UPDATE on collections and DELETE on collection_movies so any
-- accepted member (not just the owner) can rename a shared collection,
-- change its type, and remove movies from it. The collections DELETE
-- policy remains owner-only (defined in migration 009).
--
-- Uses the owner fast-path pattern (`user_id = auth.uid() OR ...`) from
-- migrations 012/013 so the RETURNING clause from .update().select()
-- still works for owners. For non-owner members, check_collection_access
-- is a SECURITY DEFINER function whose internal sub-SELECT reads
-- collection_members (not collections), so the RETURNING trap does not
-- apply.
-- ============================================

-- collections UPDATE: members can also rename/change type
DROP POLICY IF EXISTS "Users can update own or shared collections" ON public.collections;
CREATE POLICY "Members can update own or shared collections"
  ON public.collections FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.check_collection_access(id)
  );

-- collection_movies DELETE: members can also remove movies
DROP POLICY IF EXISTS "Users can delete collection movies" ON public.collection_movies;
CREATE POLICY "Members can delete collection movies"
  ON public.collection_movies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_movies.collection_id
        AND c.user_id = auth.uid()
    )
    OR public.check_collection_access(collection_id)
  );

-- collections DELETE: unchanged (owner-only via migration 009). Documented here.
