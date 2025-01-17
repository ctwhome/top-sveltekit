import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { todos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH({ params }) {
  const id = parseInt(params.id);
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id)
  });

  const [updatedTodo] = await db
    .update(todos)
    .set({ completed: !todo?.completed })
    .where(eq(todos.id, id))
    .returning();

  return json(updatedTodo);
}

export async function DELETE({ params }) {
  const id = parseInt(params.id);
  await db.delete(todos).where(eq(todos.id, id));
  return new Response(null, { status: 204 });
}
