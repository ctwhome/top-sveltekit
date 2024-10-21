<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { initializePowersync, syncWithPowersync, powersyncStore } from '$lib/utils/powersync';

  const todos = writable([]);
  const newTodo = writable('');

  const fetchTodos = async () => {
    const response = await fetch('/api/todos');
    const data = await response.json();
    todos.set(data);
  };

  const addTodo = async () => {
    const todo = newTodo.get();
    if (todo.trim() === '') return;

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: todo }),
    });

    if (response.ok) {
      newTodo.set('');
      fetchTodos();
      syncWithPowersync();
    }
  };

  const deleteTodo = async (id: string) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchTodos();
      syncWithPowersync();
    }
  };

  onMount(() => {
    fetchTodos();
    initializePowersync();
  });
</script>

<style>
  .todo-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .todo-input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .todo-list {
    list-style: none;
    padding: 0;
  }

  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .todo-item:last-child {
    border-bottom: none;
  }

  .todo-text {
    flex-grow: 1;
  }

  .todo-delete {
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
  }
</style>

<div class="todo-container">
  <input
    type="text"
    class="todo-input"
    bind:value={$newTodo}
    placeholder="Add a new todo"
  />
  <button on:click={addTodo}>Add</button>

  <ul class="todo-list">
    {#each $todos as todo (todo.id)}
      <li class="todo-item">
        <span class="todo-text">{todo.text}</span>
        <button class="todo-delete" on:click={() => deleteTodo(todo.id)}>
          Delete
        </button>
      </li>
    {/each}
  </ul>
</div>
