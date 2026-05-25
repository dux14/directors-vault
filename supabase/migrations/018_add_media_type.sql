BEGIN;

-- ===== user_movies =====
ALTER TABLE user_movies RENAME COLUMN tmdb_movie_id TO tmdb_id;

ALTER TABLE user_movies
  ADD COLUMN media_type text NOT NULL DEFAULT 'movie';

ALTER TABLE user_movies
  DROP CONSTRAINT user_movies_user_id_tmdb_movie_id_key;
ALTER TABLE user_movies
  ADD CONSTRAINT user_movies_user_id_tmdb_id_media_type_key
  UNIQUE (user_id, tmdb_id, media_type);

-- ===== collection_movies =====
ALTER TABLE collection_movies RENAME COLUMN tmdb_movie_id TO tmdb_id;

ALTER TABLE collection_movies
  ADD COLUMN media_type text NOT NULL DEFAULT 'movie';

ALTER TABLE collection_movies
  DROP CONSTRAINT collection_movies_collection_id_tmdb_movie_id_key;
ALTER TABLE collection_movies
  ADD CONSTRAINT collection_movies_collection_id_tmdb_id_media_type_key
  UNIQUE (collection_id, tmdb_id, media_type);

COMMIT;
