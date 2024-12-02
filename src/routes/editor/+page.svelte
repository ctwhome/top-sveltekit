<script context="module" lang="ts">
	declare module 'quilljs-markdown';
</script>

<script lang="ts">
	import QuillEditor from '$lib/components/editor/QuillEditor.svelte';
	import MarkdownShortcutsGuide from '$lib/components/editor/MarkdownShortcutsGuide.svelte';
</script>

<div class="p-4">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-4 text-2xl font-bold">Markdown Editor</h1>
		<MarkdownShortcutsGuide />
		<QuillEditor />
	</div>
</div>
