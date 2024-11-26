import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import { SurrealAdapter } from "$lib/auth/surreal-adapter";

export const { handle: handleAuth, signIn, signOut } = SvelteKitAuth({
  // Basic configuration
  trustHost: true,
  adapter: SurrealAdapter(),
  secret: process.env.AUTH_SECRET,

  // Configure Google provider
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
    })
  ],

  // Session handling
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

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/error',
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
});
