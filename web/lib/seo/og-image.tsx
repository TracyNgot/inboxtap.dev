import { ImageResponse } from "next/og";

export const ogImageSize = { height: 630, width: 1200 };
export const ogImageContentType = "image/png";

export function renderOgImage({
  line1,
  line2,
  tagline,
}: {
  line1: string;
  line2: string;
  tagline: string;
}) {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#050505",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,.16)",
          display: "flex",
          flexDirection: "column",
          padding: "76px 84px",
          width: 980,
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, marginBottom: 58 }}>
          Inbox<span style={{ color: "#00e676" }}>Tap</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 700 }}>
          <span>
            {line1}
            <span style={{ color: "#00e676" }}>.</span>
          </span>
          <span>
            {line2}
            <span style={{ color: "#00e676" }}>.</span>
          </span>
        </div>
        <div style={{ color: "#a3a3a3", display: "flex", fontSize: 26, marginTop: 34 }}>
          {tagline}
        </div>
      </div>
    </div>,
    ogImageSize,
  );
}
