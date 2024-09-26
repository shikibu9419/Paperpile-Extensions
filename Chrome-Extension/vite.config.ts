import { defineConfig, PluginOption } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const viteManifestHackIssue846: PluginOption & {
  renderCrxManifest: (manifest: any, bundle: any) => void;
} = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: "manifestHackIssue846",
  renderCrxManifest(_manifest, bundle) {
    bundle["manifest.json"] = bundle[".vite/manifest.json"];
    bundle["manifest.json"].fileName = "manifest.json";
    delete bundle[".vite/manifest.json"];
  },
};

const manifest = defineManifest({
  manifest_version: 3,
  author: "shikibu9419",
  name: "Paperpile Enhancements",
  description: "Enhancements for Paperpile",
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
      js: ["scripts/pdf_viewer/document_idle.ts"],
      run_at: "document_idle",
      matches: ["https://app.paperpile.com/view/*"],
    },
  ],
});

export default defineConfig({
  plugins: [viteManifestHackIssue846, crx({ manifest })],
});
