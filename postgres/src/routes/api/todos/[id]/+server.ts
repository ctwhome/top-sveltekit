import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/db';
import { todos } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { completed } = await request.json();
    if (typeof completed !== 'boolean') {
      return new Response('Invalid completed value', { status: 400 });
    }

    const [updatedTodo] = await db.update(todos)
      .set({ completed })
      .where(
        and(
          eq(todos.id, params.id),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning();

    if (!updatedTodo) {
      return new Response('Todo not found', { status: 404 });
    }

    return json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const [deletedTodo] = await db.delete(todos)
      .where(
        and(
          eq(todos.id, params.id),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning();

    if (!deletedTodo) {
      return new Response('Todo not found', { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
