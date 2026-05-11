/* ============================================
 * Person Detail Page
 * Shows person bio + filmography
 * ============================================ */

import { getPersonDetail, getPersonMovieCredits } from "@/lib/tmdb";
import PersonDetailClient from "./PersonDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPersonDetail(parseInt(id));
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

  const [person, credits] = await Promise.all([
    getPersonDetail(personId),
    getPersonMovieCredits(personId),
  ]);

  return <PersonDetailClient person={person} credits={credits} />;
}
