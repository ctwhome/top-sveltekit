<script lang="ts">
	import { onMount } from 'svelte';
	import { ShapeStream, Shape } from '@electric-sql/client';
	import type { Row } from '@electric-sql/client';

	interface TodoRow extends Row {
		id: string;
		text: string;
		completed: boolean;
	}

	let todos: TodoRow[] = [];
	let newTodoText = '';

	onMount(async () => {
		const stream = new ShapeStream({
			url: `http://localhost:3000/v1/shape/todos`
		});
		const shape = new Shape<TodoRow>(stream);
		// Initialize todos with the current shape data
		const initialData = await shape.value;
		todos = Array.from(initialData.values());
		// Subscribe to shape updates
		shape.subscribe((shapeData) => {
			todos = Array.from(shapeData.values());
			console.log('Shape data updated:', shapeData);
		});
	});

	function addTodo() {
		// Implement add todo functionality
	}

	function toggleTodo(id: string) {
		// Implement toggle todo functionality
	}

	function deleteTodo(id: string) {
		// Implement delete todo functionality
	}
</script>

<div class="todo-container">
	<h2 class="text-2xl font-bold mb-4">Todo List</h2>
	<div class="mb-4">
		<input
			class="input border p-2 mr-2"
			type="text"
			bind:value={newTodoText}
			placeholder="Add a new todo"
			on:keypress={(e) => e.key === 'Enter' && addTodo()}
		/>
		<button class="btn" on:click={addTodo}>Add Todo</button>
	</div>

	<ul class="space-y-2">
		{#each todos as todo (todo.id)}
			<li class="flex items-center">
				<input
					type="checkbox"
					checked={todo.completed}
					on:change={() => toggleTodo(todo.id)}
					class="mr-2"
				/>
				<span class="flex-grow {todo.completed ? 'line-through' : ''}">{todo.text}</span>
				<button class="bg-red-500 text-white p-1 rounded" on:click={() => deleteTodo(todo.id)}>
					Delete
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.todo-container {
		max-width: 500px;
		margin: 0 auto;
	}
</style>
