<script lang="ts">
	import { onMount } from 'svelte';
	import { chatListStore, loadChats } from '$lib/stores/chatList.store';
	import { closeMenu } from '$lib/stores/menu.store';
	import ChatListItem from './ChatListItem.svelte';

	onMount(async () => {
		loadChats();
	});

	function handleNewChat() {
		closeMenu();
		// Add any additional logic for creating a new chat here
	}
</script>

<div class="flex flex-col pr-2 gap-2 h-full sm:translate-x-0 overflow-hidden">
	<!-- New chat button -->
	<a href="/" on:click={handleNewChat}>
		<button class="btn btn-sm">New chat</button>
	</a>

	<!-- List of chats -->
	{#if $chatListStore.length}
		<div class=" h-full overflow-y-auto overflow-x-hidden pb-10">
			<!-- Today -->
			<h4 class="opacity-45 text-sm mt-2">Today</h4>
			{#each $chatListStore.filter((chat) => new Date(chat.started_at).toLocaleDateString() === new Date().toLocaleDateString()) as chat}
				<ChatListItem {chat} />
			{/each}

			<!-- This Week -->
			<h4 class="opacity-50 text-sm mt-2">Last 7 Days</h4>
			{#each $chatListStore.filter((chat) => {
				const chatDate = new Date(chat.started_at);
				const today = new Date();
				return chatDate > today.setDate(today.getDate() - 7) && chatDate.toLocaleDateString() !== new Date().toLocaleDateString();
			}) as chat}
				<ChatListItem {chat} />
			{/each}

			<!-- Before -->
			<h4 class="opacity-50 text-sm mt-2">Before</h4>
			{#each $chatListStore.filter((chat) => new Date(chat.started_at).toLocaleDateString() !== new Date().toLocaleDateString() && new Date(chat.started_at) <= new Date().setDate(new Date().getDate() - 7)) as chat}
				<ChatListItem {chat} />
			{/each}
		</div>
	{/if}
</div>
