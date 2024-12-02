<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import 'quill/dist/quill.snow.css';
	import { toolbarOptions } from './quillToolbarConfig';
	import { createKeyboardBindings } from './quillKeyboardBindings';
	import { markdownConfig } from './quillMarkdownConfig';
	import { SlashCommandsModule } from './quillSlashCommands';

	let editorElement: HTMLElement;
	let quill: any;

	onMount(async () => {
		if (browser) {
			const Quill = (await import('quill')).default;
			const { default: MarkdownShortcuts } = await import('quilljs-markdown');

			// Create Quill instance
			quill = new Quill(editorElement, {
				theme: 'snow',
				modules: {
					toolbar: toolbarOptions,
					keyboard: {
						bindings: createKeyboardBindings(quill)
					}
				},
				placeholder:
					'Start writing...\n\nTry markdown syntax:\n# Heading 1\n## Heading 2\n* Bullet point\n1. Numbered list\n> Blockquote\n```code block```\n**bold text**\n*italic text*\n\nOr type / to use slash commands'
			});

			// Initialize QuillMarkdown
			new MarkdownShortcuts(quill, markdownConfig);

			// Initialize SlashCommands
			new SlashCommandsModule(quill);
		}
	});
</script>

<div class="overflow-hidden rounded-lg border">
	<div bind:this={editorElement} class="h-[400px] bg-base-100" />
</div>

<style>
	:global(.ql-toolbar) {
		@apply border-base-300 bg-base-200;
	}

	:global(.ql-container) {
		@apply border-base-300;
	}

	:global(.ql-editor) {
		@apply min-h-[300px];
	}

	:global(.ql-snow .ql-stroke) {
		@apply stroke-current;
	}

	:global(.ql-snow .ql-fill) {
		@apply fill-current;
	}

	:global(.ql-snow .ql-picker) {
		@apply text-current;
	}

	:global(.ql-snow .ql-picker-options) {
		@apply border-base-300 bg-base-100;
	}

	:global(.ql-snow .ql-picker.ql-expanded .ql-picker-label) {
		@apply border-base-300;
	}

	:global(.ql-snow .ql-tooltip) {
		@apply border-base-300 bg-base-100 text-current shadow-lg;
	}

	:global(.ql-snow .ql-tooltip input[type='text']) {
		@apply border-base-300 bg-base-200 text-current;
	}

	:global(.slash-commands-container) {
		z-index: 1000;
	}
</style>
