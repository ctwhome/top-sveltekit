import type { LayoutServerLoad } from "./$types"
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Handle redirections based on authentication state
  if (session?.user?.id) {
    if (event.url.pathname === '/') {
      throw redirect(302, '/profile');
    }
  }
  else {
    if (event.url.pathname === '/profile') {
      throw redirect(302, '/login');
    }
  }

  return {
    // Return the session to make it available throughout the app
    session
  }
}
