import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#122559",
        }}
      >
        <div style={{ color: "white", fontSize: 118, fontWeight: 800, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
          Z
        </div>
      </div>
    ),
    { ...size }
  );
}
