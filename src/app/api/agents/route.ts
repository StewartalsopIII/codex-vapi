import { NextRequest, NextResponse } from 'next/server';

import { createAgent, getAgent, getAllAgents } from '@/lib/kv';
import { isAuthenticated } from '@/lib/auth';
import { validateAgentInput } from '@/lib/validation';

export async function GET() {
  const agents = await getAllAgents();
  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateAgentInput(body);
  if (validation.error || !validation.value) {
    return NextResponse.json({ error: validation.error ?? 'Invalid payload' }, { status: 400 });
  }

  const { name, assistantId } = validation.value;
  const existing = await getAgent(name);
  if (existing) {
    return NextResponse.json({ error: 'Agent already exists' }, { status: 409 });
  }

  try {
    const agent = await createAgent(name, assistantId);
    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent', error);
    return NextResponse.json({ error: 'Unable to create agent' }, { status: 500 });
  }
}
