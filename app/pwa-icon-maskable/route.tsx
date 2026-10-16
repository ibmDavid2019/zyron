import { ImageResponse } from "next/og";

// Maskable icons must keep content within the safe zone (~inner 80%) since
// OS launchers crop this to circles, squircles, etc. No rounding here —
// the platform applies its own mask shape.
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
        }}
      >
        <div style={{ color: "white", fontSize: 230, fontWeight: 800, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
          Z
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
