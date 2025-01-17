import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "$lib/db/db";
import type { CustomSession } from "./app";
import bcrypt from 'bcryptjs';
import Resend from "@auth/sveltekit/providers/resend";
import { eq } from "drizzle-orm";
import { users } from "$lib/db/schema";

export const { handle: handleAuth, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
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

        const user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!user || !await bcrypt.compare(password, user.password || '')) return null;

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
      if (user) {
        const userData = await db.query.users.findFirst({
          where: eq(users.id, parseInt(user.id))
        });

        if (userData) {
          token.id = userData.id;
          token.role = userData.role || 'user';
          token.name = userData.name;
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
          roles: [token.role as string]
        }
      } as CustomSession;
    }
  }
});
