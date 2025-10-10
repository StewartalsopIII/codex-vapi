import { NextRequest, NextResponse } from 'next/server';

import { deleteAgent, getAgent, updateAgent } from '@/lib/kv';
import { isAuthenticated } from '@/lib/auth';
import { validateAssistantId, validateAgentName } from '@/lib/validation';

type Params = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { name } = await params;
  const nameCheck = validateAgentName(name);
  if (nameCheck.error || !nameCheck.value) {
    return NextResponse.json({ error: nameCheck.error ?? 'Invalid name' }, { status: 400 });
  }

  const agent = await getAgent(nameCheck.value);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ agent });
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  const nameCheck = validateAgentName(name);
  if (nameCheck.error || !nameCheck.value) {
    return NextResponse.json({ error: nameCheck.error ?? 'Invalid name' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const assistantCheck = validateAssistantId((body as { assistantId?: unknown }).assistantId);
  if (assistantCheck.error || !assistantCheck.value) {
    return NextResponse.json({ error: assistantCheck.error ?? 'assistantId is required' }, { status: 400 });
  }

  const existing = await getAgent(nameCheck.value);
  if (!existing) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  try {
    const agent = await updateAgent(nameCheck.value, assistantCheck.value);
    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Failed to update agent', error);
    return NextResponse.json({ error: 'Unable to update agent' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  const nameCheck = validateAgentName(name);
  if (nameCheck.error || !nameCheck.value) {
    return NextResponse.json({ error: nameCheck.error ?? 'Invalid name' }, { status: 400 });
  }

  try {
    const success = await deleteAgent(nameCheck.value);
    if (!success) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent', error);
    return NextResponse.json({ error: 'Unable to delete agent' }, { status: 500 });
  }
}
