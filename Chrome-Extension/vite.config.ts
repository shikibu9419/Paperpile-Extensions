import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Reading time",
  description: "Add the reading time to Chrome Extension documentation articles",
  version: "1.0",
  permissions: ["activeTab", "scripting"],
  //   icons: {
  //     '16': 'images/icon-16.png',
  //     '32': 'images/icon-32.png',
  //     '48': 'images/icon-48.png',
  //     '128': 'images/icon-128.png',
  //   },
  content_scripts: [
    {
      js: ["scripts/top/document_start.ts"],
      run_at: "document_start",
      matches: ["https://app.paperpile.com/my-library/*"],
    },
    {
      js: ["scripts/top/document_idle.ts"],
      run_at: "document_idle",
      matches: ["https://app.paperpile.com/my-library/*"],
    },
    {
      js: ["scripts/pdf_viewer.ts"],
      run_at: "document_end",
      matches: ["https://app.paperpile.com/view/*"],
    },
  ],
});

export default defineConfig({
  plugins: [crx({ manifest })],
});
