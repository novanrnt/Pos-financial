import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const cookieName = 'pos_session';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-this-minimum-32-characters');

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('60d').sign(secret);
  cookies().set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60*60*24*60 });
}
export function clearSession() { cookies().delete(cookieName); }
export async function getUserId() {
  const token = cookies().get(cookieName)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return String(payload.userId); } catch { return null; }
}
export async function requireUser() {
  const id = await getUserId();
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}
