<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import 'quill/dist/quill.snow.css';

	let editorElement: HTMLElement;
	let quill: any;

	onMount(async () => {
		if (browser) {
			const Quill = (await import('quill')).default;

			const bindings = {
				'header-one': {
					key: '1',
					shortKey: true,
					handler: (range: any, context: any) => {
						quill.formatLine(range.index, range.length, 'header', 1);
					}
				},
				'header-two': {
					key: '2',
					shortKey: true,
					handler: (range: any, context: any) => {
						quill.formatLine(range.index, range.length, 'header', 2);
					}
				},
				'bullet-list': {
					key: '8',
					shortKey: true,
					handler: (range: any, context: any) => {
						quill.formatLine(range.index, range.length, 'list', 'bullet');
					}
				},
				'ordered-list': {
					key: '7',
					shortKey: true,
					handler: (range: any, context: any) => {
						quill.formatLine(range.index, range.length, 'list', 'ordered');
					}
				}
			};

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
						bindings: bindings
					}
				},
				placeholder:
					'Start writing...\n\nKeyboard shortcuts:\nCtrl/Cmd + 1: Heading 1\nCtrl/Cmd + 2: Heading 2\nCtrl/Cmd + 7: Numbered list\nCtrl/Cmd + 8: Bullet list\n\nOr use the toolbar above for more formatting options.'
			});
		}
	});
</script>

<div class="p-4">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-4 text-2xl font-bold">Rich Text Editor</h1>
		<div class="prose prose-sm mb-4">
			<p>
				This editor supports keyboard shortcuts and toolbar formatting. Try these keyboard
				shortcuts:
			</p>
			<ul class="list-disc pl-5">
				<li>Ctrl/Cmd + 1: Heading 1</li>
				<li>Ctrl/Cmd + 2: Heading 2</li>
				<li>Ctrl/Cmd + 7: Numbered list</li>
				<li>Ctrl/Cmd + 8: Bullet list</li>
				<li>Ctrl/Cmd + B: Bold</li>
				<li>Ctrl/Cmd + I: Italic</li>
			</ul>
		</div>
		<div class="overflow-hidden rounded-lg border">
			<div bind:this={editorElement} class="h-[400px]"></div>
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
