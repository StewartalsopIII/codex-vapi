import Link from 'next/link';


export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-24 text-center">
        <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          VAPI Multi-Agent Voice Platform
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold text-slate-900 sm:text-5xl">
          Launch conversational agents in minutes with reliable Vapi integrations.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Manage your team of voice assistants, deploy instantly on Vercel, and deliver a seamless
          agent experience powered by secure Next.js API routes and Vercel KV storage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to admin console
          </Link>
          <Link
            href="/admin/login"
            className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Sign in to manage agents
          </Link>
        </div>
      </div>
    </main>
  );
}
