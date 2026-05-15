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
    background_color: "#0a0a0f",
    theme_color: "#d4a843",
    orientation: "portrait",
    icons: [
      {
        src: "/icon1",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
