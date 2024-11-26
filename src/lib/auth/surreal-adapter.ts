import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken, AdapterAccountType } from "@auth/core/adapters";
import { getDb } from "$lib/db/surreal";
import type { RecordId } from "surrealdb";

export interface SurrealUser extends AdapterUser {
  id: string;
  email: string;
  emailVerified: Date | null;
  name?: string | null;
  image?: string | null;
}

export interface SurrealAccount extends Omit<AdapterAccount, 'type'> {
  userId: string;
  type: AdapterAccountType;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface SurrealSession extends AdapterSession {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface SurrealVerificationToken extends VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

type SurrealResult<T> = [{ result: T[] }];

interface SurrealRecord {
  id: RecordId<string>;
  [key: string]: unknown;
}

function extractIdFromReference(ref: unknown): string | null {
  if (!ref || typeof ref !== 'string') return null;
  const parts = ref.split(':');
  return parts.length === 2 ? parts[1] : null;
}

function assertSurrealResult<T>(result: unknown): asserts result is SurrealResult<T> {
  if (!Array.isArray(result) || !result[0] || !Array.isArray(result[0].result)) {
    throw new Error('Invalid SurrealDB result format');
  }
}

export function SurrealAdapter(): Adapter {
  return {
    async createUser(data: Partial<SurrealUser>): Promise<SurrealUser> {
      const db = await getDb();
      const [created] = await db.create('user', {
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified?.toISOString(),
        image: data.image,
      }) as [SurrealRecord];

      return {
        id: String((created.id as RecordId<string>).id),
        email: String(created.email),
        emailVerified: created.emailVerified ? new Date(String(created.emailVerified)) : null,
        name: created.name ? String(created.name) : null,
        image: created.image ? String(created.image) : null,
      };
    },

    async getUser(id: string): Promise<SurrealUser | null> {
      const db = await getDb();
      const [user] = await db.select(`user:${id}`) as [SurrealRecord | null];
      if (!user) return null;

      return {
        id: String((user.id as RecordId<string>).id),
        email: String(user.email),
        emailVerified: user.emailVerified ? new Date(String(user.emailVerified)) : null,
        name: user.name ? String(user.name) : null,
        image: user.image ? String(user.image) : null,
      };
    },

    async getUserByEmail(email: string): Promise<SurrealUser | null> {
      const db = await getDb();
      const result = await db.query<SurrealResult<SurrealRecord>>(
        'SELECT * FROM user WHERE email = $email LIMIT 1',
        { email }
      );

      assertSurrealResult<SurrealRecord>(result);
      const user = result[0].result[0];
      if (!user) return null;

      return {
        id: String((user.id as RecordId<string>).id),
        email: String(user.email),
        emailVerified: user.emailVerified ? new Date(String(user.emailVerified)) : null,
        name: user.name ? String(user.name) : null,
        image: user.image ? String(user.image) : null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }: {
      providerAccountId: string;
      provider: string;
    }): Promise<SurrealUser | null> {
      const db = await getDb();
      const result = await db.query<SurrealResult<{ user: string }>>(
        'SELECT user FROM account WHERE provider = $provider AND providerAccountId = $providerAccountId LIMIT 1',
        { provider, providerAccountId }
      );

      assertSurrealResult<{ user: string }>(result);
      const account = result[0].result[0];
      if (!account?.user) return null;

      const userId = extractIdFromReference(account.user);
      if (!userId) return null;

      return this.getUser(userId);
    },

    async updateUser(data: Partial<SurrealUser> & { id: string }): Promise<SurrealUser> {
      const db = await getDb();
      const [updated] = await db.merge(`user:${data.id}`, {
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified?.toISOString(),
        image: data.image,
      }) as [SurrealRecord];

      return {
        id: String((updated.id as RecordId<string>).id),
        email: String(updated.email),
        emailVerified: updated.emailVerified ? new Date(String(updated.emailVerified)) : null,
        name: updated.name ? String(updated.name) : null,
        image: updated.image ? String(updated.image) : null,
      };
    },

    async deleteUser(userId: string): Promise<void> {
      const db = await getDb();
      await db.delete(`user:${userId}`);
    },

    async linkAccount(data: AdapterAccount): Promise<void> {
      const db = await getDb();
      await db.create('account', {
        userId: `user:${data.userId}`,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
      });
    },

    async unlinkAccount({ providerAccountId, provider }: {
      providerAccountId: string;
      provider: string;
    }): Promise<void> {
      const db = await getDb();
      await db.query(
        'DELETE account WHERE provider = $provider AND providerAccountId = $providerAccountId',
        { provider, providerAccountId }
      );
    },

    async createSession(data: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<SurrealSession> {
      const db = await getDb();
      const [created] = await db.create('session', {
        sessionToken: data.sessionToken,
        userId: `user:${data.userId}`,
        expires: data.expires.toISOString(),
      }) as [SurrealRecord];

      return {
        sessionToken: String(created.sessionToken),
        userId: String(created.userId),
        expires: new Date(String(created.expires)),
      };
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: SurrealSession;
      user: SurrealUser;
    } | null> {
      const db = await getDb();
      const result = await db.query<SurrealResult<SurrealRecord>>(
        'SELECT * FROM session WHERE sessionToken = $sessionToken LIMIT 1',
        { sessionToken }
      );

      assertSurrealResult<SurrealRecord>(result);
      const session = result[0].result[0];
      if (!session) return null;

      const userId = extractIdFromReference(session.userId);
      if (!userId) return null;

      const user = await this.getUser(userId);
      if (!user) return null;

      return {
        session: {
          sessionToken: String(session.sessionToken),
          userId: String(session.userId),
          expires: new Date(String(session.expires)),
        },
        user,
      };
    },

    async updateSession(data: Partial<SurrealSession> & { sessionToken: string }): Promise<SurrealSession> {
      const db = await getDb();
      const [updated] = await db.merge(`session:${data.sessionToken}`, {
        expires: data.expires?.toISOString(),
      }) as [SurrealRecord];

      return {
        sessionToken: String(updated.sessionToken),
        userId: String(updated.userId),
        expires: new Date(String(updated.expires)),
      };
    },

    async deleteSession(sessionToken: string): Promise<void> {
      const db = await getDb();
      await db.delete(`session:${sessionToken}`);
    },

    async createVerificationToken(data: VerificationToken): Promise<VerificationToken> {
      const db = await getDb();
      const [created] = await db.create('verificationToken', {
        identifier: data.identifier,
        token: data.token,
        expires: data.expires.toISOString(),
      }) as [SurrealRecord];

      return {
        identifier: String(created.identifier),
        token: String(created.token),
        expires: new Date(String(created.expires)),
      };
    },

    async useVerificationToken({ identifier, token }: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const db = await getDb();
      const result = await db.query<SurrealResult<SurrealRecord>>(
        'SELECT * FROM verificationToken WHERE identifier = $identifier AND token = $token LIMIT 1',
        { identifier, token }
      );

      assertSurrealResult<SurrealRecord>(result);
      const verificationToken = result[0].result[0];
      if (!verificationToken) return null;

      await db.delete(`verificationToken:${verificationToken.token}`);
      return {
        identifier: String(verificationToken.identifier),
        token: String(verificationToken.token),
        expires: new Date(String(verificationToken.expires)),
      };
    },
  };
}
