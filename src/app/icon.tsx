import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  const accent = "#0e7490";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          M
        </div>
      </div>
    ),
    size,
  );
}

