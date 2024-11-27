import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/db/surreal';
import bcrypt from 'bcrypt';

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name?: string;
  provider?: string;
  provider_id?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const db = await getDb();

    // Query to get user with password
    const result = await db.query<UserRecord[][]>(
      'SELECT * FROM user WHERE email = $email LIMIT 1',
      { email }
    );

    console.log('Query result:', JSON.stringify(result, null, 2)); // Debug log

    // Check if we got a valid result and extract the user from nested arrays
    const user = result[0]?.[0];
    if (!user) {
      console.error('No user found with email:', email);
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if password exists
    if (!user.password) {
      console.error('No password found for user:', email);
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    try {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.error('Invalid password for user:', email);
        return json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return json({ error: 'Authentication error' }, { status: 500 });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return json({ error: 'An error occurred during login' }, { status: 500 });
  }
};
