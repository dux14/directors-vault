-- ============================================
-- Migration 007: Shared Collections System
-- Tables: collection_members, collection_invitations
-- ============================================

-- 1. Collection Members — track who has access
CREATE TABLE IF NOT EXISTS public.collection_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, user_id)
);

ALTER TABLE public.collection_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view collection members"
  ON public.collection_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_members cm
      WHERE cm.collection_id = collection_members.collection_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert members"
  ON public.collection_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collection_members cm
      WHERE cm.collection_id = collection_members.collection_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Members can remove themselves"
  ON public.collection_members FOR DELETE
  USING (user_id = auth.uid());

-- 2. Collection Invitations
CREATE TABLE IF NOT EXISTS public.collection_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, invitee_id)
);

ALTER TABLE public.collection_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own invitations"
  ON public.collection_invitations FOR SELECT
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Owners can send invitations"
  ON public.collection_invitations FOR INSERT
  WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Invitee can respond"
  ON public.collection_invitations FOR UPDATE
  USING (invitee_id = auth.uid());

-- 3. Update collections policy: members can also view shared collections
DROP POLICY IF EXISTS "Users can view own collections" ON public.collections;
CREATE POLICY "Users can view own or shared collections"
  ON public.collections FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.collection_members cm
      WHERE cm.collection_id = collections.id
      AND cm.user_id = auth.uid()
    )
  );

-- 4. Update collection_movies policies for shared access
DROP POLICY IF EXISTS "Users can view own collection movies" ON public.collection_movies;
CREATE POLICY "Users can view collection movies if member"
  ON public.collection_movies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_movies.collection_id
      AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.collection_members cm
      WHERE cm.collection_id = collection_movies.collection_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add movies to shared collections"
  ON public.collection_movies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_movies.collection_id
      AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.collection_members cm
      WHERE cm.collection_id = collection_movies.collection_id
      AND cm.user_id = auth.uid()
    )
  );
