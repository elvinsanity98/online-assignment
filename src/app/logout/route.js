import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const res = NextResponse.redirect(new URL('/login', request.url));
  res.cookies.delete('session');
  return res;
}
