import type { Handle } from '@sveltejs/kit';
import { auth } from './auth';

export const handle: Handle = async ({ event, resolve }) => {
  const authHandle = await auth;
  return authHandle.handle({ event, resolve });
};
