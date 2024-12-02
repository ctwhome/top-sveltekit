<script context="module" lang="ts">
	declare module 'quilljs-markdown';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import 'quill/dist/quill.snow.css';

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
					toolbar: [
						[{ header: [1, 2, 3, false] }],
						['bold', 'italic', 'underline', 'strike'],
						['blockquote', 'code-block'],
						[{ list: 'ordered' }, { list: 'bullet' }],
						[{ color: [] }, { background: [] }],
						['link', 'image'],
						['clean']
					],
					keyboard: {
						bindings: {
							'header-one': {
								key: '1',
								shortKey: true,
								handler: (range: any) => {
									quill.formatLine(range.index, range.length, 'header', 1);
								}
							},
							'header-two': {
								key: '2',
								shortKey: true,
								handler: (range: any) => {
									quill.formatLine(range.index, range.length, 'header', 2);
								}
							},
							'bullet-list': {
								key: '8',
								shortKey: true,
								handler: (range: any) => {
									quill.formatLine(range.index, range.length, 'list', 'bullet');
								}
							},
							'ordered-list': {
								key: '7',
								shortKey: true,
								handler: (range: any) => {
									quill.formatLine(range.index, range.length, 'list', 'ordered');
								}
							}
						}
					}
				},
				placeholder:
					'Start writing...\n\nTry markdown syntax:\n# Heading 1\n## Heading 2\n* Bullet point\n1. Numbered list\n> Blockquote\n```code block```\n**bold text**\n*italic text*'
			});

			// Initialize QuillMarkdown
			new MarkdownShortcuts(quill, {
				// Defaults
				ignoreTags: ['pre', 'strikethrough'],
				tags: {
					blockquote: {
						pattern: /^(\||\>)\s/,
						filter: false
					},
					list: {
						pattern: /^(\*|\-|\+)\s/,
						filter: false
					},
					header: {
						pattern: /^(#){1,6}\s/,
						filter: false
					},
					code: {
						pattern: /^`{3}(?:\r?\n|\r)/,
						filter: false
					}
				}
			});
		}
	});
</script>

<div class="p-4">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-4 text-2xl font-bold">Markdown Editor</h1>
		<div class="prose prose-sm">
			<p class="mb-4">This editor supports markdown syntax. Try these:</p>
			<ul class="mb-4 list-disc pl-5">
				<li># Space for heading 1</li>
				<li>## Space for heading 2</li>
				<li>* Space for bullet list</li>
				<li>1. Space for numbered list</li>
				<li>> Space for blockquote</li>
				<li>```[Enter] for code block</li>
				<li>**text** for bold</li>
				<li>*text* for italic</li>
			</ul>
			<p class="mb-4">Or use keyboard shortcuts:</p>
			<ul class="mb-4 list-disc pl-5">
				<li>Ctrl/Cmd + 1: Heading 1</li>
				<li>Ctrl/Cmd + 2: Heading 2</li>
				<li>Ctrl/Cmd + 7: Numbered list</li>
				<li>Ctrl/Cmd + 8: Bullet list</li>
				<li>Ctrl/Cmd + B: Bold</li>
				<li>Ctrl/Cmd + I: Italic</li>
			</ul>
		</div>
		<div class="overflow-hidden rounded-lg border">
			<div bind:this={editorElement} class="h-[400px] bg-base-100"></div>
		</div>
	</div>
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
</style>
