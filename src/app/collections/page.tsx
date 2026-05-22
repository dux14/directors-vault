/* ============================================
 * Collections Page — User's movie collections
 * ============================================ */

import { getUserCollections } from "@/lib/actions";
import { getPendingInvitations } from "@/lib/collection-actions";
import { getServerView } from "@/lib/view/server";
import CollectionsClient from "./CollectionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colecciones",
  description: "Tus colecciones de películas",
};

export default async function CollectionsPage() {
  const [collections, invitations, initialView] = await Promise.all([
    getUserCollections().catch(() => []),
    getPendingInvitations().catch(() => []),
    getServerView(),
  ]);

  return (
    <CollectionsClient
      initialCollections={collections}
      initialInvitations={invitations}
      initialView={initialView}
    />
  );
}
