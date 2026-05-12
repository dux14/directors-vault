-- Drop the recursive policies
DROP POLICY IF EXISTS "Members can view collection members" ON public.collection_members;
DROP POLICY IF EXISTS "Owners can insert members" ON public.collection_members;
DROP POLICY IF EXISTS "Users can view own or shared collections" ON public.collections;
DROP POLICY IF EXISTS "Users can view collection movies if member" ON public.collection_movies;
DROP POLICY IF EXISTS "Members can add movies to shared collections" ON public.collection_movies;

-- Create a SECURITY DEFINER function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION public.check_collection_access(p_collection_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- A user has access if they are the owner of the collection OR they are a member
  SELECT EXISTS (
    SELECT 1 FROM public.collections c WHERE c.id = p_collection_id AND c.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = p_collection_id AND cm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.check_collection_owner(p_collection_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- A user is owner if they own the collection record OR have the owner role in members
  SELECT EXISTS (
    SELECT 1 FROM public.collections c WHERE c.id = p_collection_id AND c.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.collection_members cm WHERE cm.collection_id = p_collection_id AND cm.user_id = auth.uid() AND cm.role = 'owner'
  );
$$;

-- 1. Policies for collection_members
CREATE POLICY "Members can view collection members"
  ON public.collection_members FOR SELECT
  USING (
    public.check_collection_access(collection_id)
  );

CREATE POLICY "Owners can insert members"
  ON public.collection_members FOR INSERT
  WITH CHECK (
    public.check_collection_owner(collection_id)
    OR user_id = auth.uid()
  );

-- 2. Policies for collections
CREATE POLICY "Users can view own or shared collections"
  ON public.collections FOR SELECT
  USING (
    public.check_collection_access(id)
  );

-- 3. Policies for collection_movies
CREATE POLICY "Users can view collection movies if member"
  ON public.collection_movies FOR SELECT
  USING (
    public.check_collection_access(collection_id)
  );

CREATE POLICY "Members can add movies to shared collections"
  ON public.collection_movies FOR INSERT
  WITH CHECK (
    public.check_collection_access(collection_id)
  );
