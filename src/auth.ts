import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import { env } from "$env/dynamic/private";
import { authenticateUser, getDb } from "$lib/db/surreal";

interface UserRecord {
  id: string;
  email: string;
  password?: string;
  name?: string;
  image?: string | null;
  provider?: string;
  provider_id?: string;
  last_login?: string;
}

export const auth = SvelteKitAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
          console.log('Missing or invalid credentials');
          return null;
        }

        try {
          console.log('Attempting login for email:', email);

          // Use SurrealDB's native signin through our authenticateUser function
          const { token, user } = await authenticateUser(email, password);

          if (!user) {
            console.log('No user found');
            return null;
          }

          // Return user object in the exact format Auth.js expects
          return {
            id: token, // Use the token as the ID since we'll use it for authentication
            email: user.email,
            name: user.name || user.email.split('@')[0],
            image: user.image || null
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    }),
    Google
  ],

  secret: env.AUTH_SECRET,
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/login',
    error: '/error',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const db = await getDb();

          // Check if user exists
          const result = await db.query<[UserRecord[]]>(
            'SELECT * FROM users WHERE email = $email LIMIT 1',
            { email: user.email }
          );

          const existingUser = result[0]?.[0];

          if (existingUser) {
            // Update existing user
            await db.query(
              'UPDATE users SET name = $name, image = $image, provider = $provider, provider_id = $provider_id, last_login = time::now() WHERE id = $id',
              {
                id: existingUser.id,
                name: user.name,
                image: user.image,
                provider: 'google',
                provider_id: user.id
              }
            );
          } else {
            // Create new user without password field
            await db.query(
              'CREATE users CONTENT { email: $email, name: $name, image: $image, provider: $provider, provider_id: $provider_id, last_login: time::now() }',
              {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: 'google',
                provider_id: user.id
              }
            );
          }
          return true;
        } catch (error) {
          console.error('Error saving Google user:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id; // This will now be the SurrealDB JWT token
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        if (account) {
          token.provider = account.provider;
          token.provider_id = account.providerAccountId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''; // This will be the SurrealDB JWT token
        session.user.email = token.email ?? '';
        session.user.name = token.name ?? '';
        session.user.image = token.picture ?? null;
      }
      return session;
    }
  },

  debug: true
});
