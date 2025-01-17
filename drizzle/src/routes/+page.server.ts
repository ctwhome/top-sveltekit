import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
  const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
  return { todos: allTodos };
}
