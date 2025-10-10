import type { NextRequest } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export type SessionPayload = {
  authenticated: boolean;
  expiresAt: string;
};

const secure = process.env.NODE_ENV === 'production';

function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeSession(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.authenticated !== 'boolean' || typeof payload.expiresAt !== 'string') {
      return null;
    }
    return payload;
  } catch (error) {
    console.error('Failed to decode session', error);
    return null;
  }
}

function isSessionValid(payload: SessionPayload | null): payload is SessionPayload {
  if (!payload) {
    return false;
  }

  if (!payload.authenticated) {
    return false;
  }

  return new Date(payload.expiresAt).getTime() > Date.now();
}

export function createSessionCookie(): ResponseCookie {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const payload: SessionPayload = { authenticated: true, expiresAt: expires.toISOString() };

  return {
    name: SESSION_COOKIE_NAME,
    value: encodeSession(payload),
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    expires,
  };
}

export function clearSessionCookie(): ResponseCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    expires: new Date(0),
  };
}

export function getSessionFromValue(raw: string | undefined): SessionPayload | null {
  if (!raw) {
    return null;
  }

  const payload = decodeSession(raw);
  if (!isSessionValid(payload)) {
    return null;
  }

  return payload;
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getSessionFromValue(raw);
}

export function isAuthenticated(request: NextRequest): boolean {
  return Boolean(getSessionFromRequest(request));
}

export function verifyAdminPassword(password: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return Boolean(password) && password === expected;
}

export { SESSION_COOKIE_NAME };
