import type { Session, User } from '@auth/core/types';
import type { Role } from '$lib/types';

// Extend the User type to include roles and id
interface CustomUser extends Omit<User, 'email'> {
	id: string;
	email: string | null | undefined;
	name?: string | null;
	image?: string | null;
	roles?: Role[];  // Use Role enum instead of string[]
}

// Extend the Session type to include our custom user
interface CustomSession extends Omit<Session, 'user'> {
	user: CustomUser;
}

// Define credentials type for auth
interface Credentials {
	email: string;
	password: string;
}

declare global {
	namespace App {
		interface Locals {
			getSession(): Promise<CustomSession | null>;
			roles?: Role[];  // Use Role enum instead of string[]
		}
		interface PageData {
			session: CustomSession | null;
		}
		// interface Error {}
		// interface Platform {}
	}
}

// Extend the auth module's types
declare module '@auth/core/types' {
	interface User extends CustomUser { }
	interface Session extends CustomSession { }
}

export { Credentials, CustomUser, CustomSession };
