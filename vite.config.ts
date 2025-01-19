import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { type ManifestOptions, VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

const manifest: Partial<ManifestOptions> | false = {
	theme_color: "#272838",
	background_color: "#272838",
	icons: [
		{ purpose: "maskable", sizes: "512x512", src: "icon512_maskable.png", type: "image/png" },
		{ purpose: "any", sizes: "512x512", src: "icon512_rounded.png", type: "image/png" },
	],
	screenshots: [
		{
			src: "/screenshots/desktop.webp",
			type: "image/webp",
			sizes: "2200x1325",
			form_factor: "wide",
		},
		{
			src: "/screenshots/mobile.webp",
			type: "image/webp",
			sizes: "780x1690",
			form_factor: "narrow",
		},
	],
	orientation: "any",
	display: "standalone",
	lang: "en-US",
	name: "Mixify",
	short_name: "Mixify",
};

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
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
			},
			manifest,
		}),
	],
	css: {
		modules: {
			generateScopedName: "[name]__[local]__[hash:base64:5]",
		},
		preprocessorOptions: {
			scss: {
				api: "modern-compiler",
				additionalData: `
				@use "~/application/styles/_screens" as *;
			`,
				includePaths: ["src"],
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
