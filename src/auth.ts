import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import { SurrealAdapter } from "$lib/auth/surreal-adapter";
import { generateUserToken } from "$lib/db/surreal";
import Resend from "@auth/sveltekit/providers/resend";

export const { handle: handleAuth, signIn, signOut } = SvelteKitAuth({
  // Basic configuration
  trustHost: true,
  adapter: SurrealAdapter(),
  secret: process.env.AUTH_SECRET,

  // Configure Google provider
  providers: [
    Resend({
      from: "chatdiamond@ctwhome.com",
      name: "Chat Diamond",
    }),
    Google,
  ],
  // Session handling
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
        session.user.email = user.email;

        // Generate scoped SurrealDB token for the user
        const surrealToken = await generateUserToken(user.id);
        session.surrealToken = surrealToken;
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
