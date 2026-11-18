import { NextResponse } from 'next/server';
import { AUTH_COOKIE_CONFIG } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete(AUTH_COOKIE_CONFIG.name);
  return response;
}
