-- ============================================
-- MACK — Movie Archive & Cinema Keeper
-- Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- User Movies — tracks watched/watchlist/not_interested
-- ============================================
create table if not exists public.user_movies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tmdb_movie_id integer not null,
  status text not null check (status in ('watched', 'want_to_watch', 'not_interested')),
  personal_rating decimal(3,1) check (personal_rating is null or (personal_rating >= 0.5 and personal_rating <= 10)),
  review_notes text,
  movie_title text,
  movie_poster_path text,
  movie_release_date text,
  movie_overview text,
  watched_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Each user can only have one entry per movie
  unique(user_id, tmdb_movie_id)
);

-- Indexes for fast lookups
create index if not exists idx_user_movies_user_id on public.user_movies(user_id);
create index if not exists idx_user_movies_status on public.user_movies(user_id, status);
create index if not exists idx_user_movies_rating on public.user_movies(user_id, personal_rating desc nulls last);
create index if not exists idx_user_movies_tmdb_id on public.user_movies(user_id, tmdb_movie_id);

-- ============================================
-- Collections — user-created movie groups
-- ============================================
create table if not exists public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  type text not null check (type in ('director', 'actor', 'genre', 'saga', 'custom')),
  cover_image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_collections_user_id on public.collections(user_id);

-- ============================================
-- Collection Movies — junction table
-- ============================================
create table if not exists public.collection_movies (
  id uuid default uuid_generate_v4() primary key,
  collection_id uuid references public.collections(id) on delete cascade not null,
  tmdb_movie_id integer not null,
  movie_title text,
  movie_poster_path text,
  sort_order integer default 0 not null,
  added_at timestamptz default now() not null,
  
  -- Each movie can only appear once per collection
  unique(collection_id, tmdb_movie_id)
);

create index if not exists idx_collection_movies_collection on public.collection_movies(collection_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.user_movies enable row level security;
alter table public.collections enable row level security;
alter table public.collection_movies enable row level security;

-- user_movies: Users can only CRUD their own data
create policy "Users can view own movies"
  on public.user_movies for select
  using (auth.uid() = user_id);

create policy "Users can insert own movies"
  on public.user_movies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own movies"
  on public.user_movies for update
  using (auth.uid() = user_id);

create policy "Users can delete own movies"
  on public.user_movies for delete
  using (auth.uid() = user_id);

-- collections: Users can only CRUD their own collections
create policy "Users can view own collections"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "Users can insert own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own collections"
  on public.collections for update
  using (auth.uid() = user_id);

create policy "Users can delete own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- collection_movies: Inherit access from parent collection
create policy "Users can view collection movies"
  on public.collection_movies for select
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_movies.collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Users can insert collection movies"
  on public.collection_movies for insert
  with check (
    exists (
      select 1 from public.collections
      where collections.id = collection_movies.collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Users can delete collection movies"
  on public.collection_movies for delete
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_movies.collection_id
      and collections.user_id = auth.uid()
    )
  );
