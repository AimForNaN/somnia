import { resolve } from 'path';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'index.js'),
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: [
				// 'node:buffer',
				// 'node:fs',
				// 'node:net',
				// 'node:path',
				// 'node:stream',
				// 'node:url',
				// 'node:util',
				'node-fetch',
			],
		},
	},
});
