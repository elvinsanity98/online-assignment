import 'server-only';
import { redirect } from 'next/navigation';
import { getSession } from './session';

export async function currentUser() {
  return await getSession();
}

export async function requireLogin() {
  const user = await getSession();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== role) {
    redirect(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
  }
  return user;
}

export function homePathFor(user) {
  if (!user) return '/login';
  return user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
}
