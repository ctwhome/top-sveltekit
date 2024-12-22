import type { RequestEvent } from '@sveltejs/kit';
import type { DefaultSession } from '@auth/core/types';

export const load = async ({ locals }: RequestEvent) => {
  const session = await locals.getSession() as DefaultSession | null;
  return {
    session
  };
};
