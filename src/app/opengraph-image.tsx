import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Director's Vault — tu bóveda personal de cine";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          gap: 24,
        }}
      >
        <div
          style={{
            color: "#d4a843",
            fontSize: 280,
            fontWeight: 800,
            letterSpacing: -16,
            lineHeight: 1,
          }}
        >
          DV
        </div>
        <div
          style={{
            color: "#f5f5f0",
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: -0.5,
          }}
        >
          Director&apos;s Vault — tu bóveda personal de cine
        </div>
      </div>
    ),
    size
  );
}
