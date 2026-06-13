import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import { currentUser } from '@/lib/auth';
import Alert from '@/components/Alert';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  if (await currentUser()) redirect('/');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Mahir&apos;sClass</h1>
        <p className="text-slate-500 text-sm mb-6">Log in to continue</p>

        <Alert type="error" message={searchParams?.error} />
        <Alert type="success" message={searchParams?.success} />

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" type="email" name="email" required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" type="password" name="password" required />
          </div>
          <button className="btn btn-primary w-full" type="submit">Log in</button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          New student?{' '}
          <Link className="text-brand font-semibold" href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
