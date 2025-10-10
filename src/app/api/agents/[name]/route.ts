import { NextRequest, NextResponse } from 'next/server';

import { deleteAgent, getAgent, updateAgent } from '@/lib/kv';
import { isAuthenticated } from '@/lib/auth';
import { validateAssistantId, validateAgentName, validatePublicKey } from '@/lib/validation';

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

  const payload = body as { assistantId?: unknown; publicKey?: unknown };
  const hasAssistantId = Object.prototype.hasOwnProperty.call(payload, 'assistantId');
  const hasPublicKey = Object.prototype.hasOwnProperty.call(payload, 'publicKey');

  if (!hasAssistantId && !hasPublicKey) {
    return NextResponse.json({ error: 'Provide assistantId and/or publicKey' }, { status: 400 });
  }

  let assistantValue: string | undefined;
  if (hasAssistantId) {
    const assistantCheck = validateAssistantId(payload.assistantId);
    if (assistantCheck.error || !assistantCheck.value) {
      return NextResponse.json({ error: assistantCheck.error ?? 'assistantId is required' }, { status: 400 });
    }
    assistantValue = assistantCheck.value;
  }

  let publicKeyValue: string | null | undefined;
  if (hasPublicKey) {
    const publicKeyCheck = validatePublicKey(payload.publicKey);
    if (publicKeyCheck.error) {
      return NextResponse.json({ error: publicKeyCheck.error }, { status: 400 });
    }
    publicKeyValue = publicKeyCheck.value ?? null;
  }

  const existing = await getAgent(nameCheck.value);
  if (!existing) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  try {
    const agent = await updateAgent(nameCheck.value, {
      ...(assistantValue !== undefined ? { assistantId: assistantValue } : {}),
      ...(hasPublicKey ? { publicKey: publicKeyValue ?? null } : {}),
    });
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
