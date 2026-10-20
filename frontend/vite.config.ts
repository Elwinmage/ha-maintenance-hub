import { defineConfig } from "vite";

// The bundle is served by the integration (see __init__.py), so it is
// written straight into the custom component folder and committed with it.
export default defineConfig({
  resolve: {
    // ha-maintenance-ui may be linked locally with its own copy of lit:
    // a single lit instance is mandatory for the elements to work.
    dedupe: ["lit"],
  },
  build: {
    lib: {
      entry: "src/card.ts",
      formats: ["es"],
      fileName: () => "maintenance-hub-card.js",
    },
    outDir: "../custom_components/maintenance_hub/frontend",
    emptyOutDir: true,
    sourcemap: false,
    // Library mode leaves ES output unminified unless asked explicitly.
    minify: true,
    rolldownOptions: { output: { minify: true } },
    target: "es2022",
  },
});
