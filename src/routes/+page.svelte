<script lang="ts">
	import NativeFileApi from '$lib/NativeFileApi.svelte';
	import Carousel from '$lib/Carousel.svelte';
	import Tiptap from '$lib/components/Tiptap.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
</script>

<svelte:head>
	<title>Top Svelte</title>
</svelte:head>

<div class="container mx-auto prose-xl">
	<div class="text-3xl mt-20">Index page</div>
	<div class="prose">
		<ul>
			<li>SvelteKit</li>
			<li>TailwindCSS (with official plugins) + DaisyUI + FlowBir</li>
			<li>Theme Switcher</li>
			<li>Markdown Routes with mdsvex</li>
			<li>Static Blog with markdown files</li>
			<li>Supabase with Auth</li>
			<li>Native File System API</li>
			<li />
		</ul>

		Custom Components:
		<ul>
			<li>Simple image carrousel</li>
			<li>Markdown editor with Tiptap</li>
			<li>Dorpdown search with autocomplete</li>
		</ul>
	</div>

	<div class="my-5" />

	<h2 class="text-2xl">Native File API</h2>
	<NativeFileApi />

	<h2 class="text-2xl">Components</h2>
	<div class="flex">
		<div class="w-1/2">
			<h3>Image carrousel</h3>
			<Carousel />

			<h3>Input search with auto complete, defer and keyboard navigation</h3>
			<Autocomplete />
		</div>
		<div class="border border-base-300 p-4 rounded w-1/2">
			<Tiptap />
		</div>
	</div>
</div>
