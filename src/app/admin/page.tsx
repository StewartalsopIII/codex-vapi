import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminDashboard from '@/components/AdminDashboard';
import LogoutButton from '@/components/LogoutButton';
import { getSessionFromValue, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = getSessionFromValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-16">
      <div className="mx-auto w-full max-w-5xl px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Agent Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, update, and remove voice agents. All actions require an authenticated session.
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="mt-10">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
