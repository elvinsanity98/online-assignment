import Link from 'next/link';
import { currentUser, homePathFor } from '@/lib/auth';
import { changePassword } from '@/actions/account';
import Alert from '@/components/Alert';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage({ searchParams }) {
  const user = await currentUser();

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Change password</h1>
        <Link href={homePathFor(user)} className="btn btn-secondary">← Back</Link>
      </div>

      <Alert type="error" message={searchParams?.error} />
      <Alert type="success" message={searchParams?.success} />

      <form action={changePassword} className="card space-y-4">
        <div>
          <label className="label" htmlFor="current_password">Current password</label>
          <input className="input" id="current_password" type="password" name="current_password" required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="new_password">New password</label>
          <input className="input" id="new_password" type="password" name="new_password" required />
          <p className="text-xs text-slate-500 mt-1">At least 6 characters.</p>
        </div>
        <div>
          <label className="label" htmlFor="confirm_password">Confirm new password</label>
          <input className="input" id="confirm_password" type="password" name="confirm_password" required />
        </div>
        <button className="btn btn-primary" type="submit">Update password</button>
      </form>
    </div>
  );
}
