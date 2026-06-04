/* ============================================
 * PWA Manifest — Next.js App Router native
 * ============================================ */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Director's Vault",
    short_name: "DV",
    description:
      "Tu bóveda personal de cine. Rastrea, califica, y organiza tu mundo cinematográfico.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0805",
    theme_color: "#d4a843",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
