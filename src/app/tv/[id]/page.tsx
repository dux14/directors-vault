import { getTvDetail } from "@/lib/tmdb";
import { getUserMovieByTmdbId } from "@/lib/actions";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import TvDetailClient from "./TvDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerTmdbLocale();
  try {
    const tv = await getTvDetail(parseInt(id), locale);
    return {
      title: tv.name,
      description: tv.overview,
    };
  } catch {
    return { title: "Serie" };
  }
}

export default async function TvDetailPage({ params }: Props) {
  const { id } = await params;
  const tvId = parseInt(id);
  const locale = await getServerTmdbLocale();

  const [tvShow, userMovie] = await Promise.all([
    getTvDetail(tvId, locale),
    getUserMovieByTmdbId(tvId, "tv").catch(() => null),
  ]);

  return <TvDetailClient tvShow={tvShow} userMovie={userMovie} />;
}
