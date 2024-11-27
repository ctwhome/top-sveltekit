<!-- <script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { todoStore } from '$lib/stores/todo.store';
	import { page } from '$app/stores';
	import type { Todo } from '$lib/models/todo';

	let todos = $state<Todo[]>([]);
	let newTodoTitle = $state('');
	let storeValue = $derived($todoStore);

	$effect(() => {
		if (storeValue) {
			todos = storeValue;
		}
	});

	onMount(async () => {
		if ($page.data.session?.user) {
			await todoStore.init();
			todos = $todoStore;
		}
	});

	async function handleSubmit() {
		if (!newTodoTitle.trim()) return;

		try {
			await todoStore.create(newTodoTitle);
			newTodoTitle = '';
		} catch (error) {
			console.error('Error creating todo:', error);
		}
	}

	async function handleToggle(todoId: string) {
		if (!$page.data.session?.user) return;
		await todoStore.toggle(todoId);
	}

	async function handleDelete(todoId: string) {
		if (!$page.data.session?.user) return;
		await todoStore.delete(todoId);
	}

	function ensureString(value: string | undefined): string {
		if (typeof value === 'undefined') {
			throw new Error('ID is undefined');
		}
		return value;
	}
</script>

<div class="flex flex-col gap-4">
	{#if $page.data.session?.user}
		<form class="flex gap-2" on:submit|preventDefault={handleSubmit}>
			<input
				type="text"
				bind:value={newTodoTitle}
				placeholder="Add a new todo"
				class="input input-bordered flex-grow"
			/>
			<button type="submit" class="btn btn-primary">Add</button>
		</form>

		<ul class="flex flex-col gap-2">
			{#each todos as todo (todo.id)}
				{@const todoId = ensureString(todo.id)}
				<li class="flex items-center gap-2 rounded-lg border border-base-300 p-2">
					<input
						type="checkbox"
						checked={todo.completed}
						on:change={() => handleToggle(todoId)}
						class="checkbox"
					/>
					<span class:line-through={todo.completed}>{todo.title}</span>
					<button class="btn btn-ghost btn-sm ml-auto" on:click={() => handleDelete(todoId)}>
						Delete
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Please sign in to manage your todos.</p>
	{/if}
</div> -->
