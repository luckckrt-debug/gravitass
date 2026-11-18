import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './data-store';
import { User } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'gravitass_futuristic_secret_key_super_secure_2026'
);

const COOKIE_NAME = 'gravitass_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // If hash is a plain demo password or bcrypt hash:
  if (hash === password) return true;
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: User): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    activeRole: user.activeRole,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as {
      id: string;
      email: string;
      role: User['role'];
      activeRole: User['activeRole'];
      name: string;
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const user = db.getUserById(payload.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

export const AUTH_COOKIE_CONFIG = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
};
