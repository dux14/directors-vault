/* ============================================
 * Collections Page — User's movie collections
 * ============================================ */

import { getUserCollections } from "@/lib/actions";
import { getPendingInvitations } from "@/lib/collection-actions";
import CollectionsClient from "./CollectionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colecciones",
  description: "Tus colecciones de películas",
};

export default async function CollectionsPage() {
  const [collections, invitations] = await Promise.all([
    getUserCollections().catch(() => []),
    getPendingInvitations().catch(() => [])
  ]);

  return <CollectionsClient initialCollections={collections} initialInvitations={invitations} />;
}
