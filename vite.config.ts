import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import autoImport from "unplugin-auto-import/vite";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import packageJson from "./package.json";

const appVersion = packageJson.version;

const manifestVersionPlugin = () => ({
  name: "manifest-version-plugin",
  apply: "build",
  async writeBundle() {
    const manifestPath = path.resolve(process.cwd(), "dist/manifest.json");
    const manifest = await readFile(manifestPath, "utf8");
    await writeFile(manifestPath, manifest.replace("__APP_VERSION__", appVersion));
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  plugins: [
    unocss(),
    react(),
    manifestVersionPlugin(),
    autoImport({
      imports: ["react"],
      dts: "src/auto-imports.d.ts",
      dirs: ["src/hooks", "src/stores", "src/components/**"]
    })
  ],
  resolve: {
    alias: {
      "~/": `${path.resolve(process.cwd(), "src")}/`
    }
  }
});
