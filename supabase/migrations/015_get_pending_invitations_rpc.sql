-- ============================================
-- Migration 015: get_pending_invitations_for_user RPC
--
-- Returns each pending invitation for the current authenticated user
-- with the collection name+type and the inviter's display_name+email
-- joined in. Wrapped in SECURITY DEFINER so the joined reads against
-- public.collections and public.user_profiles bypass RLS for this specific
-- query path only — the function is the sole entry point and is
-- WHERE-clamped to ci.invitee_id = auth.uid().
--
-- Replaces the previous client-side two-step query that failed because
-- the invitee, while still in pending status, is neither owner nor
-- accepted member of the invited collection, so the SELECT policy
-- (check_collection_access) hides the row and the PostgREST embed
-- returns null. UI then rendered hardcoded fallback strings
-- ("Colección, invitado por Usuario").
-- ============================================

CREATE OR REPLACE FUNCTION public.get_pending_invitations_for_user()
RETURNS TABLE (
  id uuid,
  collection_id uuid,
  status text,
  created_at timestamptz,
  collection_name text,
  collection_type text,
  inviter_display_name text,
  inviter_email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ci.id,
    ci.collection_id,
    ci.status,
    ci.created_at,
    c.name AS collection_name,
    c.type AS collection_type,
    p.display_name AS inviter_display_name,
    p.email AS inviter_email
  FROM public.collection_invitations ci
  JOIN public.collections c ON c.id = ci.collection_id
  LEFT JOIN public.user_profiles p ON p.id = ci.inviter_id
  WHERE ci.invitee_id = auth.uid()
    AND ci.status = 'pending'
  ORDER BY ci.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_invitations_for_user() TO authenticated;
