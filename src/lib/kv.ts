import { kv } from '@vercel/kv';

import type { Agent } from '@/types/agent';

const KEY_PREFIX = 'agent:';

export const RESERVED_AGENT_NAMES = new Set([
  'admin',
  'api',
  'auth',
  'login',
  'logout',
  '_next',
  'public',
]);

const agentKey = (name: string) => `${KEY_PREFIX}${name}`;

type AgentRecord = Partial<Agent>;

export async function getAgent(name: string): Promise<Agent | null> {
  const data = await kv.hgetall<AgentRecord>(agentKey(name));
  if (!data || !data.name || !data.assistantId || !data.createdAt) {
    return null;
  }

  return {
    name: data.name,
    assistantId: data.assistantId,
    createdAt: data.createdAt,
    publicKey: data.publicKey ?? undefined,
  };
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const keys = await kv.keys(`${KEY_PREFIX}*`);
    if (keys.length === 0) {
      return [];
    }

    const agents = await Promise.all(
      keys.map(async (key) => {
        const record = await kv.hgetall<AgentRecord>(key);
        if (!record || !record.name || !record.assistantId || !record.createdAt) {
          return null;
        }

        return {
          name: record.name,
          assistantId: record.assistantId,
          createdAt: record.createdAt,
          publicKey: record.publicKey ?? undefined,
        } as Agent;
      })
    );

    return agents.filter(Boolean) as Agent[];
  } catch (error) {
    console.error('Failed to read agents from KV', error);
    return [];
  }
}

export async function createAgent(
  name: string,
  assistantId: string,
  publicKey?: string | null
): Promise<Agent> {
  const createdAt = new Date().toISOString();
  const agent: Agent = {
    name,
    assistantId,
    createdAt,
    publicKey:
      typeof publicKey === 'string' && publicKey.trim().length > 0
        ? publicKey.trim()
        : undefined,
  };

  const record: Record<string, string> = {
    name: agent.name,
    assistantId: agent.assistantId,
    createdAt: agent.createdAt,
  };

  if (agent.publicKey) {
    record.publicKey = agent.publicKey;
  }

  await kv.hset(agentKey(name), record);
  return agent;
}

type AgentUpdates = {
  assistantId?: string;
  publicKey?: string | null;
};

export async function updateAgent(name: string, updates: AgentUpdates): Promise<Agent> {
  const existing = await getAgent(name);
  if (!existing) {
    throw new Error('Agent not found');
  }

  const nextAssistantId = updates.assistantId?.trim()?.length
    ? updates.assistantId.trim()
    : existing.assistantId;

  let nextPublicKey = existing.publicKey;
  let shouldDeletePublicKey = false;

  if (updates.publicKey !== undefined) {
    const provided = updates.publicKey;
    const trimmed = typeof provided === 'string' ? provided.trim() : '';

    if (trimmed) {
      nextPublicKey = trimmed;
    } else {
      nextPublicKey = undefined;
      shouldDeletePublicKey = true;
    }
  }

  const record: Record<string, string> = {};

  if (nextAssistantId !== existing.assistantId) {
    record.assistantId = nextAssistantId;
  }

  if (updates.publicKey !== undefined && nextPublicKey) {
    record.publicKey = nextPublicKey;
  }

  if (Object.keys(record).length > 0) {
    await kv.hset(agentKey(name), record);
  }

  if (shouldDeletePublicKey) {
    await kv.hdel(agentKey(name), 'publicKey');
  }

  return {
    ...existing,
    assistantId: nextAssistantId,
    publicKey: nextPublicKey,
  };
}

export async function deleteAgent(name: string): Promise<boolean> {
  const deleted = await kv.del(agentKey(name));
  return deleted > 0;
}
