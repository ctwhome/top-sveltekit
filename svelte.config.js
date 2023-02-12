import path from 'path';
import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
// import svg as Svelte components
import svg from '@poppanator/sveltekit-svg';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svelte.md', '.md'],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess(),
		mdsvex({
			extensions: ['.svelte.md', '.md'],
			// rehypePlugins: rehypePlugins,
			layout: {
				_: 'src/routes/_markdown.svelte'
			}
		})
	],

	kit: {
		adapter: adapter(),
		alias: {
			// these are the aliases and paths to them
			$api: path.resolve('./src/api'),
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/lib/components'),
			$assets: path.resolve('./src/assets'),
			$content: path.resolve('./src/content')
		}
	}
};

export default config;
