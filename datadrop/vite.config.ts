import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		// DuckDB WASM bundles must not be pre-bundled by Vite
		exclude: ["@duckdb/duckdb-wasm"],
	},
});
