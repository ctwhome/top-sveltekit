import { json, error } from '@sveltejs/kit';
import { sql } from '$lib/db';
import { Role } from '$lib/types';
import type { RequestEvent } from './$types';
import bcrypt from 'bcryptjs';

export async function POST({ request, locals }: RequestEvent) {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userRole = (session.user as any).roles?.[0];
  if (userRole !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  const { email, password, name, role } = await request.json();
  if (!email || !password || !name) {
    throw error(400, 'Missing required fields');
  }

  try {
    // Check if user already exists
    const [existingUser] = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;

    if (existingUser) {
      throw error(400, 'User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with role
    const [user] = await sql`
      INSERT INTO users (email, password, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role || Role.USER})
      RETURNING id, email, name, role
    `;

    return json(user);
  } catch (err) {
    console.error('User creation error:', err);
    throw error(500, 'Failed to create user');
  }
}

export async function GET({ locals }: RequestEvent) {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userRole = (session.user as any).roles?.[0];
  if (userRole !== Role.ADMIN) {
    throw error(403, 'Forbidden');
  }

  try {
    const users = await sql`
      SELECT
        id,
        email,
        name,
        ARRAY[role] as roles
      FROM users
      ORDER BY id
    `;

    return json(users);
  } catch (err) {
    throw error(500, 'Failed to fetch users');
  }
};
