import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
  const session = await locals.getSession();

  if (session) {
    throw redirect(303, '/dashboard');
  }
};
