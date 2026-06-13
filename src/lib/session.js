import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error('Missing SESSION_SECRET in .env.local');
  }
  return new TextEncoder().encode(s);
}

// Sign the user into an httpOnly cookie. Call only from a Server Action / Route Handler.
export async function createSession(user) {
  const token = await new SignJWT({ id: user.id, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
}

// Returns { id, name, role } or null.
export async function getSession() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.id, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}

export function destroySession() {
  cookies().delete(COOKIE);
}
