import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { todos } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const userTodos = await db.select()
      .from(todos)
      .where(eq(todos.userId, parseInt(session.user.id)))
      .orderBy(desc(todos.createdAt));

    return json(userTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { title } = await request.json();
    if (!title) {
      return new Response('Title is required', { status: 400 });
    }

    const [newTodo] = await db.insert(todos)
      .values({
        title,
        userId: parseInt(session.user.id)
      })
      .returning();

    return json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
