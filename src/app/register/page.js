import Link from 'next/link';
import { redirect } from 'next/navigation';
import { registerAction } from '@/actions/auth';
import { currentUser } from '@/lib/auth';
import Alert from '@/components/Alert';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({ searchParams }) {
  if (await currentUser()) redirect('/');

  const name = searchParams?.name || '';
  const email = searchParams?.email || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-6">Register as a student to answer assignments</p>

        <Alert type="error" message={searchParams?.error} />

        <form action={registerAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input className="input" id="name" type="text" name="name" defaultValue={name} required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" type="email" name="email" defaultValue={email} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" type="password" name="password" required />
            <p className="text-xs text-slate-500 mt-1">At least 6 characters.</p>
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input className="input" id="confirm" type="password" name="confirm" required />
          </div>
          <button className="btn btn-primary w-full" type="submit">Create account</button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link className="text-brand font-semibold" href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
