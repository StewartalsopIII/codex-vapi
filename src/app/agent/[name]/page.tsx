import { notFound } from 'next/navigation';
import Link from 'next/link';

import VapiWidget from '@/components/VapiWidget';
import { getAgent as getAgentByName } from '@/lib/kv';
import { validateAgentName } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type AgentPageProps = {
  params: Promise<{
    name: string;
  }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { name } = await params;
  const nameCheck = validateAgentName(name);
  if (nameCheck.error || !nameCheck.value) {
    notFound();
  }

  const agent = await getAgentByName(nameCheck.value);

  if (!agent) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-24">
        <Link href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
          ← Back to agents
        </Link>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">{agent.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Assistant ID
            <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
              {agent.assistantId}
            </span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Using public key
            <span className="ml-2 rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
              {agent.publicKey ?? 'project default'}
            </span>
          </p>
          <p className="mt-6 text-base text-slate-600">
            Connect in real time through the Vapi voice platform. Use the widget below to start or end a
            call and monitor live events as they stream from Vapi.
          </p>

          <div className="mt-8">
            <VapiWidget assistantId={agent.assistantId} publicKey={agent.publicKey} />
          </div>
        </div>
      </div>
    </main>
  );
}
