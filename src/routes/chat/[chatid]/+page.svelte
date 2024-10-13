<script>
	import { page } from '$app/stores';
	import ChatWindow from '$components/chats/ChatWindow.svelte';
	import { loadChat, cleanChat } from '$lib/stores/chat.store';
	import { onMount } from 'svelte';

	let unsubscribe;

	onMount(() => {
		// subscribe to $page.params.chatid
		unsubscribe = page.subscribe(({ params }) => {
			if (params.chatid) {
				loadChat(params.chatid);
			}
		});

		return () => {
			// unsubscribe from $page.params.chatid
			if (unsubscribe) {
				unsubscribe();
				cleanChat();
			}
		};
	});
</script>

<ChatWindow />
