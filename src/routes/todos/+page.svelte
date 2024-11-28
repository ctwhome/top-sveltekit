<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { todos } from '$lib/stores/todo.store';
	import MaterialSymbolsAdd from '~icons/material-symbols/add';
	import MaterialSymbolsDeleteOutline from '~icons/material-symbols/delete-outline';
	import { page } from '$app/stores';

	let newTodoTitle = '';
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		const session = $page.data.session;
		if (session?.user?.id) {
			try {
				await todos.init(session.user.id);
			} catch (e) {
				error = 'Failed to load todos';
				console.error(e);
			} finally {
				loading = false;
			}
		} else {
			loading = false;
		}
	});

	onDestroy(() => {
		todos.destroy();
	});

	async function handleSubmit() {
		if (!newTodoTitle.trim()) return;

		error = null;
		try {
			await todos.addTodo(newTodoTitle.trim());
			newTodoTitle = '';
		} catch (e) {
			error = 'Failed to add todo';
			console.error(e);
		}
	}

	async function deleteTodo(id: string) {
		error = null;
		try {
			await todos.deleteTodo(id);
		} catch (e) {
			error = 'Failed to delete todo';
			console.error(e);
		}
	}

	async function toggleTodo(id: string) {
		error = null;
		try {
			await todos.toggleTodo(id);
		} catch (e) {
			error = 'Failed to update todo';
			console.error(e);
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	{#if $page.data.session?.user}
		<h1 class="mb-8 text-3xl font-bold">My Todo List</h1>

		{#if error}
			<div class="alert alert-error mb-4">
				<span>{error}</span>
			</div>
		{/if}

		<!-- Add Todo Form -->
		<form on:submit|preventDefault={handleSubmit} class="mb-8 flex gap-2">
			<input
				type="text"
				bind:value={newTodoTitle}
				placeholder="Add a new todo..."
				class="input input-bordered flex-1"
			/>
			<button type="submit" class="btn btn-primary">
				<MaterialSymbolsAdd class="h-6 w-6" />
				Add
			</button>
		</form>

		<!-- Todo List -->
		{#if loading}
			<div class="flex justify-center">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			<div class="space-y-4">
				{#each $todos as todo (todo.id)}
					<div class="card bg-base-200">
						<div class="card-body flex-row items-center justify-between p-4">
							<div class="flex items-center gap-4">
								<input
									type="checkbox"
									checked={todo.completed}
									on:change={() => toggleTodo(todo.id || '')}
									class="checkbox"
								/>
								<span class:line-through={todo.completed} class="text-lg">
									{todo.title}
								</span>
							</div>
							<button
								on:click={() => deleteTodo(todo.id || '')}
								class="btn btn-circle btn-ghost"
								title="Delete todo"
							>
								<MaterialSymbolsDeleteOutline class="h-6 w-6" />
							</button>
						</div>
					</div>
				{:else}
					<p class="text-center text-gray-500">No todos yet. Add one above!</p>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold">Todo List</h1>
			<p class="text-lg">Please sign in to manage your todos.</p>
		</div>
	{/if}
</div>
