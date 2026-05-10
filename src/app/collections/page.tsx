/* ============================================
 * Collections Page — User's movie collections
 * ============================================ */

import { getUserCollections } from "@/lib/actions";
import CollectionsClient from "./CollectionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colecciones",
  description: "Tus colecciones de películas",
};

export default async function CollectionsPage() {
  const collections = await getUserCollections().catch(() => []);

  return <CollectionsClient initialCollections={collections} />;
}
