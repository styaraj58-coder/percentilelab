import type { CapacitorConfig } from "@capacitor/cli";

// Remote-hosted setup: the native app is a thin shell that loads the live
// site directly, rather than bundling a static export. This app relies on
// server actions, auth cookies, and API routes that only work against the
// real Next.js server - a static export would break all of that. `webDir`
// still has to point at an existing folder (Capacitor requires it even
// though its contents are unused here), so it's a minimal placeholder.
const config: CapacitorConfig = {
  appId: "in.percentilelab.app",
  appName: "Percentile Lab",
  webDir: "capacitor-www",
  server: {
    url: "https://www.percentilelab.in",
    androidScheme: "https",
  },
};

export default config;
