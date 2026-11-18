import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { createSessionToken, AUTH_COOKIE_CONFIG } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // Verify token & establish session cookie
    const token = await createSessionToken(user);
    const response = NextResponse.json({ user, message: 'Logged in successfully' });

    response.cookies.set(AUTH_COOKIE_CONFIG.name, token, AUTH_COOKIE_CONFIG.options);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login error' }, { status: 500 });
  }
}
