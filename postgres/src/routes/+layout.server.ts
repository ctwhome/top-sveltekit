import type { LayoutServerLoad } from "./$types"
import { redirect } from '@sveltejs/kit';
import { DB_HOST, DB_NAME, DB_USER } from '$env/static/private';
import { dev } from '$app/environment';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Add redirections if needed
  if (!session?.user && event.url.pathname === '/profile') {
    throw redirect(302, '/');
  }

  return {
    session,
    dbInfo: dev ? {
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER
    } : {
      host: 'production',
      database: 'production',
      user: 'production'
    }
  }
}
// export const prerender = true
// export const ssr = false;
