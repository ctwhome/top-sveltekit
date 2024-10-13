<script>
	import ChatList from '$components/chats/ChatList.svelte';
	// export let data;
</script>

<div
	class="container -mt-6 mx-auto grid grid-cols-[0px_1fr] sm:grid-cols-[200px_1fr] overflow-hidden"
>
	<!-- Chats -->
	<ChatList />

	<!-- Slot for content -->
	<slot />
</div>
