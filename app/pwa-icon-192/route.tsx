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
          borderRadius: 44,
        }}
      >
        <div style={{ color: "white", fontSize: 126, fontWeight: 800, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
          Z
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
