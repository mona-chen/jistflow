import { defineConfig } from "vite";
const locales = require("../../locales");
const meta = require("../../package.json");

const isProduction = process.env.NODE_ENV === "production";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
	mode: isProduction ? "production" : "development",
	build: {
		target: ["chrome87", "firefox78", "safari14", "es2017"],
		manifest: "manifest.json",
		rollupOptions: {
			input: {
				app: "./src/sw.ts",
			},
			output: {
				entryFileNames: "sw.js",
			},
		},
		cssCodeSplit: true,
		assetsInlineLimit: 0,
		outDir: `${__dirname}/../../built/_sw_dist_`,
		assetsDir: ".",
		emptyOutDir: false,
		sourcemap: process.env.NODE_ENV === "development",
		reportCompressedSize: false,
		commonjsOptions: {
			include: [/firefish-js/, /node_modules/],
		},
	},
	resolve: {
		alias: {
			"@/": `${__dirname}/src/`,
		},
		extensions: [".js", ".ts"],
	},
	define: {
		_VERSION_: JSON.stringify(meta.version),
		_LANGS_: JSON.stringify(
			Object.entries(locales).map(([k, v]) => [k, v._lang_]),
		),
		_ENV_: JSON.stringify(process.env.NODE_ENV),
		_DEV_: !isProduction,
		_PERF_PREFIX_: JSON.stringify("Firefish:"),
	},
	plugins: [
		viteCompression({
			algorithm: "brotliCompress",
			verbose: false,
		}),
	],
});
