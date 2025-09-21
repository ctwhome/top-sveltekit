import type { LayoutServerLoad } from "./$types"
import { redirect } from '@sveltejs/kit';
import { DB_HOST, DB_NAME, DB_USER } from '$env/static/private';
import { dev } from '$app/environment';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Add redirections if needed
  if (!session?.user && event.url.pathname === '/profile') {
    throw redirect(302, '/');
  }

  // Get version from package.json
  let version = '1.0.0';
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    version = packageJson.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
  }

  return {
    session,
    version,
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
