import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from '$lib/db';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
  const { email, password, name } = await request.json();
  if (!email || !password || !name) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const [existingUser] = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;

    if (existingUser) {
      return json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [user] = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING id, email, name
    `;

    return json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'An error occurred during registration' }, { status: 500 });
  }
};
