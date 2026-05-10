/* ============================================
 * Collection Detail Page
 * Shows movies within a specific collection
 * ============================================ */

import { getUserCollections, getCollectionMovies } from "@/lib/actions";
import CollectionDetailClient from "./CollectionDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;

  const [collections, movies] = await Promise.all([
    getUserCollections(),
    getCollectionMovies(id),
  ]);

  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  return (
    <CollectionDetailClient collection={collection} initialMovies={movies} />
  );
}
