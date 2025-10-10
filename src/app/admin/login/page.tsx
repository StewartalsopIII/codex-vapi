import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminLoginForm from '@/components/AdminLoginForm';
import { getSessionFromValue, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = getSessionFromValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (session) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Admin Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the administrator password to access the agent management console.
          </p>
        </div>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
