import { writable } from 'svelte/store';
import type { Todo } from '$lib/types';

export const todos = writable<Todo[]>([]);

export const todoStore = {
  subscribe: todos.subscribe,

  set: (newTodos: Todo[]) => {
    todos.set(newTodos);
  },

  add: async (content: string) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: {
        'content-type': 'application/json'
      }
    });
    const newTodo = await response.json();
    todos.update(current => [...current, newTodo]);
  },

  toggle: async (id: number) => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PATCH'
    });
    const updatedTodo = await response.json();
    todos.update(current =>
      current.map(todo => (todo.id === id ? updatedTodo : todo))
    );
  },

  delete: async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    });
    todos.update(current => current.filter(todo => todo.id !== id));
  }
};
