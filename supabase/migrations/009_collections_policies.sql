-- Ensure INSERT, UPDATE, DELETE policies exist for collections
DROP POLICY IF EXISTS "Users can insert own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update own or shared collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;

CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own or shared collections"
  ON public.collections FOR UPDATE
  USING (
    public.check_collection_owner(id)
  );

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (
    user_id = auth.uid()
  );
