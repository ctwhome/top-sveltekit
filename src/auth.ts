import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import bcrypt from 'bcrypt';
import { env } from "$env/dynamic/private";

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name?: string;
  image?: string | null;
}

export const auth = SvelteKitAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<{ id: string; email: string; name?: string; image?: string | null; } | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const db = await import('$lib/db/surreal').then(m => m.getDb());
          console.log('Attempting login for email:', credentials.email);

          // Query to get user with password
          const result = await db.query<[UserRecord[]]>(
            'SELECT * FROM user WHERE email = $email LIMIT 1',
            { email: credentials.email }
          );

          const user = result[0]?.[0];
          console.log('Found user:', user ? 'yes' : 'no');

          if (!user?.password) {
            console.log('No user found or no password');
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password.toString(), user.password);
          console.log('Password valid:', isValid);

          if (!isValid) {
            return null;
          }

          // Return user object in the exact format Auth.js expects
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            image: null
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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.email = token.email ?? '';
        session.user.name = token.name ?? '';
      }
      return session;
    }
  },

  debug: true
});
