/* ============================================
 * Person Detail Page
 * Shows person bio + filmography
 * ============================================ */

import { getPersonDetail, getPersonMovieCredits, getPersonTvCredits } from "@/lib/tmdb";
import { getServerTmdbLocale } from "@/lib/i18n/server";
import PersonDetailClient from "./PersonDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerTmdbLocale();
  try {
    const person = await getPersonDetail(parseInt(id), locale);
    return {
      title: person.name,
      description: person.biography?.slice(0, 160) || `Filmografía de ${person.name}`,
    };
  } catch {
    return { title: "Persona" };
  }
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const personId = parseInt(id);
  const locale = await getServerTmdbLocale();

  const [person, credits, tvCredits] = await Promise.all([
    getPersonDetail(personId, locale),
    getPersonMovieCredits(personId, locale),
    getPersonTvCredits(personId, locale),
  ]);

  return <PersonDetailClient person={person} credits={credits} tvCredits={tvCredits} />;
}
