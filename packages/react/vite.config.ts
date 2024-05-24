import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      bundledPackages: ["@embellish/core"],
    }),
  ],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src", "index.js"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
});
