
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const todoStore = $state<TodoState>({
  todos: [],
  loading: true,
  error: null
});

export const getTodos = async () => {
  todoStore.loading = true;
  try {
    const response = await fetch('/api/todos');
    if (!response.ok) throw new Error('Failed to fetch todos');
    const data = await response.json();
    todoStore.todos = data;
    todoStore.error = null;
  } catch (error) {
    todoStore.error = error instanceof Error ? error.message : 'An error occurred';
  } finally {
    todoStore.loading = false;
  }
};

export const addTodo = async (title: string) => {
  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!response.ok) throw new Error('Failed to add todo');
    const data = await response.json();

    todoStore.todos = [data, ...todoStore.todos];
    todoStore.error = null;
  } catch (error) {
    todoStore.error = error instanceof Error ? error.message : 'An error occurred';
  }
};

export const toggleTodo = async (id: string, completed: boolean) => {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    if (!response.ok) throw new Error('Failed to update todo');
    const data = await response.json();

    todoStore.todos = todoStore.todos.map(todo =>
      todo.id === id ? data : todo
    );
    todoStore.error = null;
  } catch (error) {
    todoStore.error = error instanceof Error ? error.message : 'An error occurred';
  }
};

export const deleteTodo = async (id: string) => {
  try {
    const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete todo');
    todoStore.todos = todoStore.todos.filter(todo => todo.id !== id);
    todoStore.error = null;
  } catch (error) {
    todoStore.error = error instanceof Error ? error.message : 'An error occurred';
  }
};



