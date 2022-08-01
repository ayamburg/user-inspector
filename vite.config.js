import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  short_name: "User Checker",
  name: "User Checker",
  version: "0.1.0",
  manifest_version: 3,
  permissions: ["storage", "tabs", "activeTab"],
  content_scripts: [
    {
      matches: ["https://*.reddit.com/*"],
      run_at: "document_end",
      js: ["src/main.js"],
    },
  ],
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
