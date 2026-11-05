import { NextResponse } from 'next/server';
import { makeSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.json({ error: 'ADMIN_PASSWORD が未設定です' }, { status: 500 });
  if (typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, makeSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
