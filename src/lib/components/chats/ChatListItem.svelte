<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { archiveChat } from '$lib/stores/chatList.store';
	import { closeMenu } from '$lib/stores/menu.store';
	import LucideArchive from '~icons/lucide/archive';

	export let chat;

	function handleChatClick() {
		closeMenu();
		goto('/chat/' + chat.id);
	}

	function handleArchive(event: Event) {
		event.stopPropagation();
		archiveChat(chat.id);
		closeMenu();
	}
</script>

<button
	class="btn w-full btn-sm grid grid-cols-[1fr_auto] gap-2 group"
	class:btn-ghost={$page.params.chatid !== chat.id}
	on:click={handleChatClick}
>
	<div class="line-clamp-1 text-left">
		{chat.title || 'New chat'}
	</div>
	<button class="tooltip" data-tip="Archive chat">
		<button
			class="opacity-0 group-hover:opacity-100"
			class:opacity-100={$page.params.chatid === chat.id}
			on:click={handleArchive}
		>
			<LucideArchive />
		</button>
	</button>
</button>
