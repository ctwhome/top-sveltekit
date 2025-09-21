import { readFile } from 'fs/promises';
import { join } from 'path';
import { compile } from 'mdsvex';
import mdsvexConfig from '../../../mdsvex.config.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const changelogPath = join(process.cwd(), 'CHANGELOG.md');
		const content = await readFile(changelogPath, 'utf-8');

		// Process markdown server-side
		const processed = await compile(content, mdsvexConfig as any);

		// Extract just the HTML body content
		const html = processed?.code
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/^\s*<[^>]+>|<\/[^>]+>\s*$/g, '') || '';

		return {
			changelog: content,
			changelogHtml: html
		};
	} catch (error) {
		console.error('Error reading changelog:', error);
		const fallback = '# Changelog\n\nNo changelog available.';
		const processed = await compile(fallback, mdsvexConfig as any);
		return {
			changelog: fallback,
			changelogHtml: processed?.code || '<h1>Changelog</h1><p>No changelog available.</p>'
		};
	}
};