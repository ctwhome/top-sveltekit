import type { RequestHandler } from './$types';
import { sql } from '$lib/db';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { completed } = await request.json();
    if (typeof completed !== 'boolean') {
      return new Response('Invalid completed value', { status: 400 });
    }

    const todoId = params.id;

    const [todo] = await sql`
      UPDATE todos
      SET completed = ${completed}
      WHERE id = ${todoId}
      AND user_id = ${session.user.id}
      RETURNING *
    `;

    if (!todo) {
      return new Response('Todo not found', { status: 404 });
    }

    return new Response(JSON.stringify(todo), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const todoId = params.id;

    const [todo] = await sql`
      DELETE FROM todos WHERE id = ${todoId} AND user_id = ${session.user.id} RETURNING id
    `;

    if (!todo) {
      return new Response('Todo not found', { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
