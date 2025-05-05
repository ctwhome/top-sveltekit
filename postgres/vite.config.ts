import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite'
import VitePluginRestart from 'vite-plugin-restart';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tailwindcss from "@tailwindcss/vite";

const config = {
	plugins: [
		sveltekit(),
		tailwindcss(),
		Icons({
			compiler: 'svelte',
		}),
		VitePluginRestart({ restart: ['./content/**'] }) as any,
		viteStaticCopy({ targets: [{ src: './src/lib/content/*', dest: './content/' }] }) as any,
	],
	server: {
		// Disable CORS locally to avoid CORS issues with the API in production
		cors: false,
		// Needed for the API to work locally with Docker
		host: '0.0.0.0',
		port: 5173,
		open: true,
	},
	// optimizeDeps: {
	// 	disabled: true,
	// },
};


export default defineConfig(config);