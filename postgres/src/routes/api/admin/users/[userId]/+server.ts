import { json, error } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { Role } from '$lib/types';
import type { RequestEvent } from './$types';

export async function DELETE({ params, locals }: RequestEvent) {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userRole = (session.user as any).roles?.[0];
  if (userRole !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  try {
    const [user] = await sql`
      DELETE FROM users
      WHERE id = ${params.userId}
      RETURNING id
    `;

    if (!user) {
      throw error(404, 'User not found');
    }

    return json({ success: true });
  } catch (err) {
    console.error('User deletion error:', err);
    throw error(500, 'Failed to delete user');
  }
}
