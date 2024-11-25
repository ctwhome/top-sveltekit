<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { todoStore } from '$lib/stores/todo.store';
	import MaterialSymbolsAdd from '~icons/material-symbols/add';
	import MaterialSymbolsDeleteOutline from '~icons/material-symbols/delete-outline';

	let newTodoTitle = '';

	onMount(() => {
		todoStore.init();
	});

	onDestroy(() => {
		todoStore.destroy();
	});

	async function handleSubmit() {
		if (!newTodoTitle.trim()) return;
		await todoStore.create(newTodoTitle.trim());
		newTodoTitle = '';
	}

	async function deleteTodo(id: string) {
		await todoStore.delete(id);
	}
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-8 text-3xl font-bold">Todo List</h1>

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
	<div class="space-y-4">
		{#each $todoStore as todo (todo.id)}
			<div class="card bg-base-200">
				<div class="card-body flex-row items-center justify-between p-4">
					<div class="flex items-center gap-4">
						<input
							type="checkbox"
							checked={todo.completed}
							on:change={() => todoStore.toggle(todo.id || '')}
							class="checkbox"
						/>
						<span class:line-through={todo.completed} class="text-lg">
							{todo.title}
						</span>
					</div>
					<button on:click={() => deleteTodo(todo.id || '')} class="btn btn-circle btn-ghost">
						<MaterialSymbolsDeleteOutline class="h-6 w-6" />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
