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
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern-compiler",
				additionalData: `
				@use "~/application/styles/_screens" as *;
			`,
			includePaths: ['src']
			},
		},
	},
	resolve: {
		alias: {
			"~": resolve(__dirname, "src"),
		},
	},
	esbuild: {
		target: "es2020",
	},
});
