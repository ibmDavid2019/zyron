import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.zyron.fitness",
  appName: "ZYRON",
  // Never actually served — server.url below always overrides it. Capacitor's
  // CLI just refuses to run without a webDir that exists on disk.
  webDir: "capacitor-www",
  server: {
    url: "https://zyron-fitness.vercel.app",
    cleartext: false,
  },
  android: {
    // The modern bridge (addWebMessageListener) stops delivering JS<->native
    // messages after ~5min once the WebView is backgrounded, which would
    // silently truncate GPS tracks recorded with the screen off. Safe here
    // because the WebView only ever loads our own domain.
    useLegacyBridge: true,
  },
};

export default config;
