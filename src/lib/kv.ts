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
        } as Agent;
      })
    );

    return agents.filter(Boolean) as Agent[];
  } catch (error) {
    console.error('Failed to read agents from KV', error);
    return [];
  }
}

export async function createAgent(name: string, assistantId: string): Promise<Agent> {
  const agent: Agent = {
    name,
    assistantId,
    createdAt: new Date().toISOString(),
  };

  await kv.hset(agentKey(name), agent);
  return agent;
}

export async function updateAgent(name: string, assistantId: string): Promise<Agent> {
  const existing = await getAgent(name);
  if (!existing) {
    throw new Error('Agent not found');
  }

  const updated: Agent = {
    ...existing,
    assistantId,
  };

  await kv.hset(agentKey(name), { assistantId });
  return updated;
}

export async function deleteAgent(name: string): Promise<boolean> {
  const deleted = await kv.del(agentKey(name));
  return deleted > 0;
}
