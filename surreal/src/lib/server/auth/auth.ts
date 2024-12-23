import { SvelteKitAuth } from "@auth/sveltekit";
import CredentialsProvider from "@auth/core/providers/credentials";
import type { Provider } from "@auth/core/providers";
import type { User } from "@auth/core/types";

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
  secret: "your-secret-key", // In production, use process.env.AUTH_SECRET
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

      if (token) {
        if (session.user) {
          session.user.email = token.email as string;
          session.user.name = token.name as string | null;
          (session.user as any).id = token.id;
        }

        // Add token information to session
        (session as any).token = {
          jti: token.jti,
          iat: token.iat,
          exp: token.exp,
          sub: token.sub,
          raw: token // Include the full token for display
        };
      }
      return session;
    }
  }
});
