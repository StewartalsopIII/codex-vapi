import Link from 'next/link';

export default function AgentNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Agent not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          We could not find the requested agent. It may have been removed or the URL is incorrect.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
