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
      entry: resolve(__dirname, "src", "index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
});
