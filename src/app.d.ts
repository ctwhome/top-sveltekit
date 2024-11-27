// See https://kit.svelte.dev/docs/types#app
import type { Session } from "@auth/core/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null;
		}
		interface PageData {
			session: Session | null;
		}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			admin?: boolean;
		};
		expires: string;
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		id: string;
		email?: string | null;
		name?: string | null;
		picture?: string | null;
		sub?: string;
		admin?: boolean;
		provider?: string;
		iat?: number;
		exp?: number;
		jti?: string;
	}
}

export { };
