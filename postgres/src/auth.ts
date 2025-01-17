import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import { pool, sql } from "$lib/db";
import type { CustomSession } from "./app";
import bcrypt from 'bcryptjs';
import Resend from "@auth/sveltekit/providers/resend";

export const { handle: handleAuth, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  adapter: PostgresAdapter(pool),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    Resend({
      from: "top-sveltekit@ctwhome.com",
      name: "Chat Diamond",
    }),
    Google,
    Credentials({
      name: 'Credentials',
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const [user] = await sql`
          SELECT * FROM users
          WHERE email = ${email}
        `;

        if (!user || !await bcrypt.compare(password, user.password)) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || null,
          image: user.image || null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        // Get user data including role on initial sign in
        const [userData] = await sql`
          SELECT id, role, name
          FROM users
          WHERE id = ${parseInt(user.id, 10)}
        `;

        if (userData) {
          token.id = userData.id;
          token.role = userData.role || 'user';
          token.name = userData.name;
          // Store the provider in the token
          token.provider = account?.provider || 'credentials';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!session?.user || !token) return session;

      return {
        ...session,
        provider: token.provider as string,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          roles: [token.role as string] // Use role from JWT token
        }
      } as CustomSession;
    }
  }
});
