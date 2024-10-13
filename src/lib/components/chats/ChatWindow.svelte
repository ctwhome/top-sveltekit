<script lang="ts">
	import { onMount } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import MaterialSymbolsArrowCircleUpRounded from '~icons/material-symbols/arrow-circle-up-rounded';
	import CiPaperclipAttechmentHorizontal from '~icons/ci/paperclip-attechment-horizontal';
	import {
		isStreaming,
		stopMessageStreaming,
		currentStreamedMessage
	} from '../../stores/streamingMessages.store';
	import {
		chatStore,
		createNewChat,
		addMessage,
		streamingMessagesStore,
		updateStreamingMessage,
		finalizeStreamingMessage,
		streamFromAllProviders,
		type Message,
		loadChat
	} from '$lib/stores/chat.store';
	import { persisted } from 'svelte-persisted-store';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let openAIEnabled = persisted('openAIEnabled', true);
	let claudeEnabled = persisted('claudeEnabled', false);
	let geminiEnabled = persisted('geminiEnabled', false);

	let textarea: HTMLTextAreaElement;
	let textareaValue = '';
	let isLoading = false;

	let chatContainer: HTMLDivElement;
	let currentChatId: string | null = null;

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	async function handleIntroInput(e) {
		if (e.key === 'Enter' && e.shiftKey === false) {
			e.preventDefault();
			sendMessage();
		}
	}

	async function sendMessage() {
		if (!textareaValue.trim()) return;

		const newMessage: Message = {
			user: textareaValue
		};

		try {
			if (!currentChatId) {
				const newChatId = await createNewChat(textareaValue);
				if (newChatId) {
					currentChatId = newChatId;
					await addMessage(newMessage, newChatId);
					if (browser) {
						// Update the URL without triggering a navigation
						window.history.pushState({}, '', `/chat/${newChatId}`);
						// Update the page store manually
						page.update((p) => ({ ...p, params: { ...p.params, chatid: newChatId } }));
					}
				}
			} else {
				await addMessage(newMessage, currentChatId);
			}

			textareaValue = '';
			textarea.style.height = 'auto';
		} catch (error) {
			console.error('Error sending message:', error);
			// You might want to show an error message to the user here
		}
	}

	function handleStop() {
		stopMessageStreaming('all');
	}

	onMount(() => {
		currentChatId = $page.params.chatid || null;
		if (currentChatId) {
			loadChat(currentChatId);
		}
		scrollToBottom();
	});

	$: {
		if ($chatStore.messages || $streamingMessagesStore) {
			scrollToBottom();
		}
	}

	$: enabledProvidersCount = [$openAIEnabled, $claudeEnabled, $geminiEnabled].filter(
		Boolean
	).length;

	$: gridClass =
		enabledProvidersCount === 1
			? 'grid-cols-1'
			: enabledProvidersCount === 2
				? 'grid-cols-2'
				: 'grid-cols-3';
</script>

<div class="grid grid-rows-[1fr_auto] bg-base-200 p-4 h-full overflow-hidden">
	<div class="overflow-scroll">
		<!-- Chat Messages -->
		<div bind:this={chatContainer}>
			{#if !$chatStore.messages || $chatStore.messages.length === 0}
				<div class="text-center mt-10 opacity-30 text-xl">Start conversation</div>
			{:else}
				<div class="flex flex-col gap-4 overflow-auto">
					{#each $chatStore.messages as message}
						<div class="chat-message">
							<ChatMessage content={message.user} sender="user" />

							<div class="ai-responses grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
								{#if message?.answers?.openai}
									<ChatMessage content={message.answers.openai} sender="openai" />
								{/if}
								{#if message?.answers?.claude}
									<ChatMessage content={message.answers.claude} sender="claude" />
								{/if}
								{#if message?.answers?.gemini}
									<ChatMessage content={message.answers.gemini} sender="gemini" />
								{/if}
							</div>
						</div>
					{/each}

					{#if $streamingMessagesStore}
						<div class="chat-message">
							<div class="ai-responses grid gap-4 {gridClass}">
								{#if $openAIEnabled && $streamingMessagesStore?.answers?.openai}
									<ChatMessage content={$streamingMessagesStore.answers.openai} sender="openai" />
								{/if}
								{#if $claudeEnabled && $streamingMessagesStore?.answers?.claude}
									<ChatMessage content={$streamingMessagesStore.answers.claude} sender="claude" />
								{/if}
								{#if $geminiEnabled && $streamingMessagesStore?.answers?.gemini}
									<ChatMessage content={$streamingMessagesStore.answers.gemini} sender="gemini" />
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<!-- Input Textarea -->
	<div>
		<!-- Controls -->
		<div class="mb-4 flex items-center">
			<div class="form-control">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm checkbox-primary"
						bind:checked={$openAIEnabled}
					/>
					<span class="ml-2 label-text">OpenAI</span>
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm checkbox-primary"
						bind:checked={$claudeEnabled}
					/>
					<span class="ml-2 label-text">Claude</span>
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<input
						type="checkbox"
						class="checkbox checkbox-sm checkbox-primary"
						bind:checked={$geminiEnabled}
					/>
					<span class="ml-2 label-text">Gemini</span>
				</label>
			</div>
		</div>

		<!-- Input Textarea -->
		<div class="flex w-full justify-center gap-2 align-bottom">
			<div class="tooltip" data-tip="Attach files">
				<button class="btn">
					<CiPaperclipAttechmentHorizontal class="rotate-90 size-6" />
				</button>
			</div>
			<textarea
				bind:this={textarea}
				bind:value={textareaValue}
				class="textarea textarea-bordered w-full overflow-hidden"
				placeholder="Message"
				rows="1"
				on:input={(e) => {
					e.target.style.height = 'auto';
					e.target.style.height = e.target.scrollHeight + 'px';
				}}
				on:keydown={handleIntroInput}
			/>
			{#if $isStreaming.openai || $isStreaming.claude || $isStreaming.gemini}
				<button class="btn btn-error p-1" on:click={handleStop}>Stop</button>
			{:else}
				<button class="btn btn-primary p-1" on:click={sendMessage} disabled={!textareaValue.trim()}>
					<MaterialSymbolsArrowCircleUpRounded class="size-8" />
				</button>
			{/if}
		</div>
	</div>
</div>
