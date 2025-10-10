'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { Agent } from '@/types/agent';

type FormState = {
  name: string;
  assistantId: string;
};

type EditingState = {
  name: string;
  assistantId: string;
} | null;

async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch('/api/agents');
  if (!response.ok) {
    throw new Error('Failed to load agents');
  }

  const data = (await response.json()) as { agents?: Agent[] };
  return data.agents ?? [];
}

async function createAgentRequest(payload: FormState) {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? 'Failed to create agent');
  }

  const result = (await response.json()) as { agent: Agent };
  return result.agent;
}

async function updateAgentRequest(name: string, assistantId: string) {
  const response = await fetch(`/api/agents/${name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistantId }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? 'Failed to update agent');
  }

  const result = (await response.json()) as { agent: Agent };
  return result.agent;
}

async function deleteAgentRequest(name: string) {
  const response = await fetch(`/api/agents/${name}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? 'Failed to delete agent');
  }
}

const initialForm: FormState = {
  name: '',
  assistantId: '',
};

export default function AdminDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const agent = await createAgentRequest(formState);
      setAgents((prev) => [...prev, agent]);
      setFormState(initialForm);
      setSuccessMessage(`Agent "${agent.name}" created successfully.`);
    } catch (createError) {
      console.error(createError);
      setError(createError instanceof Error ? createError.message : 'Failed to create agent.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (agent: Agent) => {
    setEditing({ name: agent.name, assistantId: agent.assistantId });
    setSuccessMessage(null);
    setError(null);
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateAgentRequest(editing.name, editing.assistantId);
      setAgents((prev) => prev.map((agent) => (agent.name === updated.name ? updated : agent)));
      setEditing(null);
      setSuccessMessage(`Agent "${updated.name}" updated successfully.`);
    } catch (updateError) {
      console.error(updateError);
      setError(updateError instanceof Error ? updateError.message : 'Failed to update agent.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteAgentRequest(name);
      setAgents((prev) => prev.filter((agent) => agent.name !== name));
      setSuccessMessage(`Agent "${name}" deleted.`);
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete agent.');
    } finally {
      setSaving(false);
    }
  };

  const updateEditingAssistantId = (value: string) => {
    setEditing((prev) => (prev ? { ...prev, assistantId: value } : prev));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add New Agent</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create a fresh VAPI agent by providing a unique name and the assistant ID from the Vapi dashboard.
        </p>

        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Agent name
            <input
              required
              minLength={2}
              maxLength={50}
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="voice-agent"
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Assistant ID
            <input
              required
              value={formState.assistantId}
              onChange={(event) => setFormState((prev) => ({ ...prev, assistantId: event.target.value }))}
              placeholder="asst_1234"
              className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create Agent'}
            </button>
            <button
              type="button"
              onClick={loadAgents}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Existing Agents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage assistant IDs or remove agents you no longer need.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No agents yet. Create one above to get started.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Assistant ID</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" aria-label="actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <tr key={agent.name}>
                    <td className="px-4 py-3 font-medium text-slate-900">{agent.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{agent.assistantId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(agent.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(agent)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(agent.name)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Edit Agent</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the assistant ID for <span className="font-semibold">{editing.name}</span>.
          </p>
          <form onSubmit={handleUpdate} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="flex flex-col text-sm font-medium text-slate-700">
                Assistant ID
                <input
                  required
                  value={editing.assistantId}
                  onChange={(event) => updateEditingAssistantId(event.target.value)}
                  className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
    </div>
  );
}
