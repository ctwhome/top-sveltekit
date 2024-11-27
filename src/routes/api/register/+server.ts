import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/db/surreal';
import bcrypt from 'bcrypt';

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name?: string;
  image?: string;
  provider: string;
  provider_id?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const db = await getDb();

    console.log('Checking for existing user with email:', email);

    // Query for existing user
    const queryResult = await db.query<UserRecord[][]>(
      'SELECT * FROM users WHERE email = $email LIMIT 1',
      { email }
    );
    console.log('Query result:', JSON.stringify(queryResult, null, 2));

    // Check if we got any actual user data
    const existingUser = queryResult[0]?.[0];

    if (existingUser && existingUser.email) {
      console.log('User already exists with email:', email);
      return json({ error: 'User already exists' }, { status: 400 });
    }

    console.log('No existing user found, proceeding with registration');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated hash for new user');

    // Create user with minimal required fields
    const createResult = await db.query<UserRecord[][]>(
      `CREATE users CONTENT {
        email: $email,
        password: $hashedPassword,
        name: $name,
        provider: "email"
      } RETURN *`,
      { email, hashedPassword, name }
    );

    const newUser = createResult[0]?.[0];
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    console.log('Created new user:', JSON.stringify(newUser, null, 2));

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return json({ error: 'An error occurred during registration' }, { status: 500 });
  }
};
