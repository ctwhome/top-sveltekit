// See https://kit.svelte.dev/docs/types#app
import type { DefaultSession, Session } from '@auth/core/types';

declare global {
	namespace App {
		interface Locals {
			auth: Session | null;
		}
		interface PageData {
			session: Session | null;
		}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session extends DefaultSession {
		user: {
			id: string;
			email: string;
			name?: string | null;
			image?: string | null;
		} & DefaultSession['user'];
	}
}

export { };
