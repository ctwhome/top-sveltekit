import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { sql } from '$lib/db';
import bcryptjs from 'bcryptjs';

export async function PUT({ request, locals }: RequestEvent) {
  const session = await locals.getSession();
  if (!session?.user?.email) {
    throw error(401, 'Not authenticated');
  }

  const { oldPassword, newPassword } = await request.json();
  if (!oldPassword || !newPassword) {
    throw error(400, 'Both old and new passwords are required');
  }

  try {
    // Get user from database
    const [user] = await sql`
      SELECT id, password
      FROM auth_user
      WHERE email = ${session.user.email}
    `;

    if (!user) {
      return json({ message: 'User not found' }, { status: 404 });
    }

    // Verify old password
    const validPassword = await bcryptjs.compare(oldPassword, user.password);
    if (!validPassword) {
      throw error(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await sql`
      UPDATE auth_user
      SET password = ${hashedPassword}
      WHERE id = ${user.id}
    `;

    return json({ message: 'Password updated successfully' });
  } catch (err: unknown) {
    console.error('Password update error:', err);
    throw error(500, 'Failed to update password');
  }
};
