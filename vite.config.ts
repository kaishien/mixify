import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	plugins: [
		react({
			babel: {
				parserOpts: {
					plugins: ["decorators-legacy", "classProperties"],
				},
			},
		}),
		svgr(),
	],
	resolve: {
		alias: {
			"~": resolve(__dirname, "src"),
		},
	},
	esbuild: {
		target: "es2020",
	},
});
