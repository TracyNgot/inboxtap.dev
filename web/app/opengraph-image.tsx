import { ImageResponse } from "next/og";

export const alt = "InboxTap — catch every email, extract every code";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 700 }}>
          <span>
            Catch every email<span style={{ color: "#00e676" }}>.</span>
          </span>
          <span>
            Extract every code<span style={{ color: "#00e676" }}>.</span>
          </span>
        </div>
        <div style={{ color: "#a3a3a3", display: "flex", fontSize: 26, marginTop: 34 }}>
          Local SMTP capture for deterministic email-flow tests.
        </div>
      </div>
    </div>,
    size,
  );
}
