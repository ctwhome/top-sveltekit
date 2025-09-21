import { json, error } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { Role } from '$lib/types';
import type { RequestEvent } from './$types';

export async function PUT({ locals, params, request }: RequestEvent) {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userRole = (session.user as any).roles?.[0];
  if (userRole !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  const userId = parseInt(params.userId, 10);
  if (isNaN(userId)) {
    throw error(400, 'Invalid user ID');
  }

  const { role: newRole, action } = await request.json();
  if (!newRole || !action || (action !== 'add' && action !== 'remove')) {
    throw error(400, 'Invalid role or action');
  }

  console.log('Updating role:', { userId, newRole, action });

  try {
    // Update the user's role
    const [updatedUser] = await sql`
      UPDATE users
      SET role = ${action === 'add' ? newRole : Role.USER}
      WHERE id = ${userId}
      RETURNING id, email, role
    `;

    if (!updatedUser) {
      throw error(404, 'User not found');
    }

    console.log('Updated user:', updatedUser);

    return json({ success: true });
  } catch (err) {
    console.error('Error updating user role:', err);
    throw error(500, 'Failed to update user role');
  }
};
