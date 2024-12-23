import { SvelteKitAuth } from "@auth/sveltekit";
import CredentialsProvider from "@auth/core/providers/credentials";
import { SurrealDBAdapter } from "@auth/surrealdb-adapter";
import type { Provider } from "@auth/core/providers";
import type { User } from "@auth/core/types";
import clientPromise from "../db/surrealdb";

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required');
}

const providers: Provider[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "hello@example.com"
      },
      password: {
        label: "Password",
        type: "password"
      }
    },
    async authorize(credentials): Promise<User | null> {
      // This is where you would typically validate against your database
      // For now, we'll just do a simple check
      const email = credentials?.email;
      const password = credentials?.password;

      if (typeof email !== 'string' || typeof password !== 'string') return null;

      // TODO: Replace with actual database check
      if (email === "test@example.com" && password === "password") {
        return {
          id: "1",
          email,
          name: "Test User",
        };
      }
      return null;
    }
  })
];

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers,
  adapter: SurrealDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
      }
      return session;
    }
  }
});
