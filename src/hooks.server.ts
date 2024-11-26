// See https://kit.svelte.dev/docs/hooks
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import { SurrealAdapter } from "$lib/auth/surreal-adapter";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import bcrypt from 'bcrypt';

// Auth.js configuration
const authHandle = SvelteKitAuth({
  trustHost: true,
  adapter: SurrealAdapter(),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await import('$lib/db/surreal').then(m => m.getDb());
        const result = await db.query<[{ result: Array<{ id: string; email: string; password: string }> }]>(
          'SELECT * FROM user WHERE email = $email LIMIT 1',
          { email: credentials.email }
        );

        const user = result[0]?.result?.[0];
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;
      }
      return session;
    },
    async signIn({ user }) {
      return !!user;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
}).handle;

// Export the handle function that combines all server hooks
export const handle = sequence(authHandle);
