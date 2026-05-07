import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://chrmod.net",
  output: "static",
  build: {
    format: "directory",
  },
  trailingSlash: "ignore",
});
