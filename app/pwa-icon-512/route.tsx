import { ImageResponse } from "next/og";

export async function GET() {
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
          borderRadius: 116,
        }}
      >
        <div style={{ color: "white", fontSize: 336, fontWeight: 800, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
          Z
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
