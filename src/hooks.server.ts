// See https://kit.svelte.dev/docs/hooks
import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import Credentials from "@auth/sveltekit/providers/credentials";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import type { AdapterUser } from "@auth/core/adapters";
import bcrypt from 'bcrypt';

// Auth.js configuration
const authHandle = SvelteKitAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE) || 24 * 60 * 60, // 24 hours
    updateAge: Number(process.env.AUTH_SESSION_UPDATE_AGE) || 60 * 60, // 1 hour
  },
  providers: [
    Google,
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await import('$lib/db/surreal').then(m => m.getDb());
        const result = await db.query<[{
          result: Array<{
            id: string;
            email: string;
            password: string;
            name?: string;
            image?: string;
            admin?: boolean;
            emailVerified?: string;
          }>
        }]>(
          'SELECT * FROM user WHERE email = $email LIMIT 1',
          { email: credentials.email }
        );

        const user = result[0]?.result?.[0];
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Ensure required fields are strings, not undefined
        const id = user.id;
        const email = user.email;

        if (!id || !email) return null;

        return {
          id,
          email,
          name: user.name ?? null,
          image: user.image ?? null,
          admin: user.admin ?? false,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        const customUser = user as CustomUser;
        // Add user info to the token on first sign in
        token.id = customUser.id;
        token.email = customUser.email;
        token.name = customUser.name;
        token.picture = customUser.image;
        token.admin = customUser.admin ?? false;

        if (customUser.emailVerified) {
          token.emailVerified = customUser.emailVerified;
        }
      }

      if (account) {
        // Add OAuth account info
        token.provider = account.provider;
        token.accessToken = account.access_token;

        // For Google OAuth, update profile info
        if (account.provider === 'google' && profile) {
          token.email_verified = profile.email_verified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Add token info to the session
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        if (typeof token.admin === 'boolean') {
          session.user.admin = token.admin;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      // For OAuth sign-ins, create or update user in SurrealDB
      if (account?.provider === 'google') {
        const db = await import('$lib/db/surreal').then(m => m.getDb());
        try {
          await db.query(
            `
            UPDATE user SET
              name = $name,
              image = $image,
              emailVerified = time::now(),
              provider = $provider
            WHERE email = $email
            ELSE
            CREATE user SET
              email = $email,
              name = $name,
              image = $image,
              emailVerified = time::now(),
              provider = $provider
            `,
            {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              provider: account.provider
            }
          );
        } catch (error) {
          console.error('Error updating user in SurrealDB:', error);
          return false;
        }
      }

      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
}).handle;

// Handle function to set session in locals
const sessionHandle: Handle = async ({ event, resolve }) => {
  if (event.locals.session) {
    // Session is already set by AuthJS
    return resolve(event);
  }

  // Get the session from the cookie if available
  const session = await event.locals.getSession();
  event.locals.session = session;

  return resolve(event);
};

// Export the handle function that combines all server hooks
export const handle = sequence(authHandle, sessionHandle);
