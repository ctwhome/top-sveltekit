<script lang="ts">
	import { page } from '$app/stores';
	import ArcticonsOpenaiChatgpt from '~icons/arcticons/openai-chatgpt';
	import SimpleIconsAnthropic from '~icons/simple-icons/anthropic';
	import RiGeminiFill from '~icons/ri/gemini-fill';
	import CarbonCopyFile from '~icons/carbon/copy-file';
	import CarbonEdit from '~icons/carbon/edit';
	import CarbonCheckmark from '~icons/carbon/checkmark';
	import CarbonClose from '~icons/carbon/close';
	import { createEventDispatcher, onMount } from 'svelte';

	export let content: string;
	export let sender: 'user' | 'openai' | 'claude' | 'gemini';

	let copied = false;
	let timeoutId: number;
	let isEditing = false;
	let editedContent = content;
	let textareaRef: HTMLTextAreaElement;

	const dispatch = createEventDispatcher();

	onMount(() => {
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});

	function copyToClipboard() {
		navigator.clipboard
			.writeText(content)
			.then(() => {
				copied = true;
				if (timeoutId) clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					copied = false;
				}, 2000);
			})
			.catch((err) => {
				console.error('Failed to copy: ', err);
			});
	}

	function handleEdit() {
		isEditing = true;
		editedContent = content;
		setTimeout(() => {
			if (textareaRef) {
				textareaRef.focus();
			}
		}, 0);
	}

	function saveEdit() {
		content = editedContent;
		isEditing = false;
	}

	function cancelEdit() {
		isEditing = false;
		editedContent = content;
	}
</script>

<div
	class="flex gap-2 items-start mb-4 p-4 rounded-box bg-opacity-50"
	class:bg-base-100={sender !== 'user'}
>
	<div class="flex size-7 items-center justify-center">
		{#if sender === 'user'}
			<img
				class="mask mask-squircle pointer-events-none"
				alt="user"
				src={$page.data?.session?.user?.image ??
					'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
			/>
		{:else if sender === 'openai'}
			<ArcticonsOpenaiChatgpt class="text-base-content size-6" />
		{:else if sender === 'claude'}
			<SimpleIconsAnthropic class="text-base-content size-6" />
		{:else if sender === 'gemini'}
			<RiGeminiFill class="text-base-content size-6" />
		{/if}
	</div>
	<div class="text-md flex-grow">
		{#if isEditing && sender === 'user'}
			<textarea
				bind:value={editedContent}
				bind:this={textareaRef}
				class="w-full p-2 bg-base-200 rounded-box"
				rows="3"
			></textarea>
		{:else}
			<!-- Use @html to render the parsed markdown content -->
			<div class="prose max-w-none">
				{@html content}
			</div>
		{/if}
	</div>
	<div class="relative flex">
		{#if sender === 'user'}
			{#if isEditing}
				<button class="btn btn-ghost btn-sm" on:click={saveEdit} title="Save edit">
					<CarbonCheckmark class="text-base-content size-4" />
				</button>
				<button class="btn btn-ghost btn-sm" on:click={cancelEdit} title="Cancel edit">
					<CarbonClose class="text-base-content size-4" />
				</button>
			{:else}
				<button class="btn btn-ghost btn-sm" on:click={handleEdit} title="Edit message">
					<CarbonEdit class="text-base-content size-4" />
				</button>
			{/if}
		{:else}
			<button class="btn btn-ghost btn-sm" on:click={copyToClipboard} title="Copy message content">
				<CarbonCopyFile class="text-base-content size-4" />
			</button>
			{#if copied}
				<div
					class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-base-300 text-base-content text-xs rounded shadow"
				>
					Copied!
				</div>
			{/if}
		{/if}
	</div>
</div>
