import { ImageResponse } from "next/og";
import { person } from "@/resources";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const accent = "#0e7490";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #021a22 0%, #041f2a 50%, #061927 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            borderRadius: 48,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              M
            </div>
            <div
              style={{
                color: "white",
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {person.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {person.role}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                height: 2,
                width: 96,
                background: accent,
                borderRadius: 999,
              }}
            />
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 22, fontWeight: 500 }}>
              Portfolio
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

