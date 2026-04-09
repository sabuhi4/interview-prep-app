'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const AUTH_COOKIE_NAME = 'admin-authenticated';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function loginAction(password: string) {
  if (!ADMIN_PASSWORD) {
    return {
      success: false,
      error: 'Admin password not configured. Please set ADMIN_PASSWORD in .env.local'
    };
  }

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid password' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/admin/login');
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === 'true';
}
