<script lang="ts">
	import LoginButton from '$components/Login/LoginButton.svelte';

	const mockMessages = [
		{ text: 'Hello! How can I assist you today?', isUser: false },
		{ text: "I'd like to know more about AI.", isUser: true },
		{
			text: 'Certainly! Artificial Intelligence (AI) is a broad field of computer science...',
			isUser: false
		}
	];
</script>

<div class="flex flex-col items-center justify-center min-h-screen overflow-auto -mt-28">
	<div class="hero min-h-screen">
		<div class="hero-content text-neutral-content text-center">
			<div class="max-w-md">
				<h1 class="mb-5 text-5xl font-bold">top-sveltekit</h1>
				<p class="mb-5">
					Experience the power of advanced AI assistants in a native-like app interface.
				</p>

				<LoginButton />
			</div>
		</div>

		<!-- <div
			class="mt-8 bg-base-200 rounded-lg p-4 shadow-lg"
			in:fly={{ y: 50, duration: 500, delay: 300 }}
		>
			<h2 class="text-2xl font-semibold mb-4">Try Our Chat Interface</h2>
			<div class="space-y-4">
				{#each mockMessages as message}
					<div class="chat {message.isUser ? 'chat-end' : 'chat-start'}">
						<div
							class="chat-bubble {message.isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'}"
						>
							{message.text}
						</div>
					</div>
				{/each}
			</div>
		</div> -->
	</div>
</div>
