import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/db';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const todos = await sql` SELECT * FROM todos WHERE user_id = ${session.user.id} ORDER BY created_at DESC`;
    return json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { title } = await request.json();
    if (!title) {
      return new Response('Title is required', { status: 400 });
    }

    const [todo] = await sql` INSERT INTO todos (title, user_id) VALUES (${title}, ${session.user.id}) RETURNING *`;
    return json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
