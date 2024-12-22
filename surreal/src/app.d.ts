// See https://kit.svelte.dev/docs/types#app
import type { DefaultSession, JWT } from '@auth/core/types';

declare module '@auth/core/types' {
	interface Session extends DefaultSession {
		token?: JWT;
	}
}

declare global {
	namespace App {
		interface Locals {
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
	}
}

export { };
