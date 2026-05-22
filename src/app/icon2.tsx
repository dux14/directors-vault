import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function IconXL() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0c0805",
          color: "#d4a843",
          fontSize: 315,
          fontWeight: 800,
          letterSpacing: -22,
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
