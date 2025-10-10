import { NextRequest, NextResponse } from 'next/server';

import { clearSessionCookie, createSessionCookie, verifyAdminPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { action } = body as { action?: string };

  if (action === 'login') {
    const password = (body as { password?: string }).password ?? '';

    try {
      if (!verifyAdminPassword(password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(createSessionCookie());
    return response;
  }

  if (action === 'logout') {
    const response = NextResponse.json({ success: true });
    response.cookies.set(clearSessionCookie());
    return response;
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
