import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt));
  return json(allTodos);
}

export async function POST({ request }) {
  const { content } = await request.json();
  const [newTodo] = await db.insert(todos).values({ content }).returning();
  return json(newTodo);
}
