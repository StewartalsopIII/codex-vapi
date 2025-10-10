'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import type { Agent } from '@/types/agent';

async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch('/api/agents', { method: 'GET' });
  if (!response.ok) {
    throw new Error('Failed to load agents');
  }

  const data = (await response.json()) as { agents?: Agent[] };
  return data.agents ?? [];
}

const formatDate = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch (error) {
    console.error('Failed to format date', error);
    return isoDate;
  }
};

export default function AgentGrid() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAgents();
      setAgents(result);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 text-center text-sm text-slate-500">
        Loading agents…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={loadAgents}
          className="mt-3 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="mt-12 text-center text-sm text-slate-500">
        No agents yet. Head to the admin panel to create your first VAPI agent.
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                <span className="text-xs uppercase tracking-wide text-slate-400">Agent</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Assistant ID
                <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                  {agent.assistantId}
                </span>
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Created {formatDate(agent.createdAt)}</span>
              <Link
                href={`/agent/${agent.name}`}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
              >
                View agent
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
