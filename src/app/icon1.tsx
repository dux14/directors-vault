import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function IconLarge() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0f",
          color: "#d4a843",
          fontSize: 118,
          fontWeight: 800,
          letterSpacing: -8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        DV
      </div>
    ),
    size
  );
}
