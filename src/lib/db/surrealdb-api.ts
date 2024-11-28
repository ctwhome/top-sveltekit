import { page } from '$app/stores';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';
import type { Session } from '@auth/core/types';
import { Surreal } from 'surrealdb';
import type { LiveHandler } from 'surrealdb';

// For REST API
const REST_URL = (env.PUBLIC_SURREAL_URL || 'http://localhost:8000').replace('/rpc', '');
// For WebSocket
const WS_URL = env.PUBLIC_SURREAL_URL || 'ws://localhost:8000/rpc';
const SURREAL_NS = env.PUBLIC_SURREAL_NS || 'test';
const SURREAL_DB = env.PUBLIC_SURREAL_DB || 'test';

interface SurrealResponse<T> {
  time: string;
  status: string;
  result: T[];
}

export class SurrealDBClient {
  private static db: Surreal | null = null;

  // WebSocket Methods
  static async initWebSocket() {
    if (!this.db) {
      this.db = new Surreal();
      await this.db.connect(WS_URL);
      await this.db.use({ namespace: SURREAL_NS, database: SURREAL_DB });
    }
    return this.db;
  }

  static async query<T>(query: string, vars: Record<string, any> = {}): Promise<T[]> {
    const db = await this.initWebSocket();
    const result = await db.query<[SurrealResponse<T>]>(query, vars);
    return result[0]?.result || [];
  }

  static async live<T extends Record<string, unknown>>(
    query: string,
    callback: LiveHandler<T>
  ) {
    const db = await this.initWebSocket();
    return await db.live<T>(query, callback);
  }

  static async kill(queryId: any) {
    if (this.db) {
      await this.db.kill(queryId);
    }
  }

  // REST Methods
  private static getHeaders(): Headers {
    const headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    const session = get(page).data.session as Session | null;
    if (session?.user) {
      headers.set('Authorization', `Bearer ${session.user.id}`);
    }

    headers.set('surreal-ns', SURREAL_NS);
    headers.set('surreal-db', SURREAL_DB);

    return headers;
  }

  private static getFetchOptions(method: string, headers: Headers, body?: string): RequestInit {
    return {
      method,
      headers,
      body,
      mode: 'cors',
      cache: 'no-cache',
    };
  }

  static async select<T>(table: string): Promise<T[]> {
    const headers = this.getHeaders();
    const response = await fetch(`${REST_URL}/key/${table}`,
      this.getFetchOptions('GET', headers)
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to select from ${table}: ${response.statusText}. ${errorText}`);
    }

    return response.json();
  }

  static async create<T>(table: string, data: Partial<T>): Promise<T> {
    const headers = this.getHeaders();
    const response = await fetch(`${REST_URL}/key/${table}`,
      this.getFetchOptions('POST', headers, JSON.stringify(data))
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create record in ${table}: ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    return result[0];
  }

  static async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const headers = this.getHeaders();
    const response = await fetch(`${REST_URL}/key/${table}/${id}`,
      this.getFetchOptions('PATCH', headers, JSON.stringify(data))
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update record ${id} in ${table}: ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    return result[0];
  }

  static async delete(table: string, id: string): Promise<void> {
    const headers = this.getHeaders();
    const response = await fetch(`${REST_URL}/key/${table}/${id}`,
      this.getFetchOptions('DELETE', headers)
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete record ${id} from ${table}: ${response.statusText}. ${errorText}`);
    }
  }

  // Cleanup
  static async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Example usage in a store:
/*
import { writable } from 'svelte/store';
import { SurrealDBClient } from '$lib/db/surrealdb-api';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const todos = writable<Todo[]>([]);

export const todoStore = {
  async loadTodos() {
    try {
      const result = await SurrealDBClient.select<Todo>('todos');
      todos.set(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  },

  async addTodo(title: string) {
    try {
      const todo = await SurrealDBClient.create<Todo>('todos', {
        title,
        completed: false
      });
      todos.update(current => [...current, todo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  },

  async toggleTodo(id: string, completed: boolean) {
    try {
      const updated = await SurrealDBClient.update<Todo>('todos', id, { completed });
      todos.update(current =>
        current.map(todo => todo.id === id ? updated : todo)
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  },

  async deleteTodo(id: string) {
    try {
      await SurrealDBClient.delete('todos', id);
      todos.update(current => current.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }
};
*/
