import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Lets the dev server be reached from a phone on the same Wi-Fi (e.g.
  // http://192.168.1.13:3000) — without this Next.js blocks cross-origin
  // requests to dev assets/HMR, which silently breaks client interactivity.
  allowedDevOrigins: ["192.168.1.*", "*.trycloudflare.com"],
};

export default nextConfig;
