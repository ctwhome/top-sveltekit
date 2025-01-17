<script lang="ts">
	import { todoStore } from '$lib/stores/todoStore';
	import { Trash2, CheckCircle, Circle } from 'lucide-svelte';

	export let data;
	$: todoStore.set(data.todos);

	let newTodoContent = '';

	async function handleSubmit() {
		if (!newTodoContent.trim()) return;
		await todoStore.add(newTodoContent);
		newTodoContent = '';
	}
</script>

<div class="mx-auto max-w-xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Todo List</h1>

	<form on:submit|preventDefault={handleSubmit} class="mb-4 flex gap-2">
		<input
			type="text"
			bind:value={newTodoContent}
			placeholder="Add a new todo..."
			class="input input-bordered flex-1"
		/>
		<button type="submit" class="btn btn-primary">Add</button>
	</form>

	<ul class="space-y-2">
		{#each $todoStore as todo (todo.id)}
			<li class="bg-base-200 flex items-center gap-2 rounded-lg p-2">
				<button on:click={() => todoStore.toggle(todo.id)} class="btn btn-ghost btn-sm btn-circle">
					{#if todo.completed}
						<CheckCircle class="h-5 w-5" />
					{:else}
						<Circle class="h-5 w-5" />
					{/if}
				</button>
				<span class:line-through={todo.completed} class="flex-1">
					{todo.content}
				</span>
				<button
					on:click={() => todoStore.delete(todo.id)}
					class="btn btn-ghost btn-sm btn-circle text-error"
				>
					<Trash2 class="h-5 w-5" />
				</button>
			</li>
		{/each}
	</ul>
</div>
