import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 9,
        }}
      >
        <div style={{ color: "white", fontSize: 21, fontWeight: 800, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
          Z
        </div>
      </div>
    ),
    { ...size }
  );
}
