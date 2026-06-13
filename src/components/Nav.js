import Link from 'next/link';
import { homePathFor } from '@/lib/auth';

export default function Nav({ user }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href={homePathFor(user)} className="font-bold text-lg no-underline text-slate-800">
          Mahir&apos;s<span className="text-brand">Class</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold capitalize">
              {user.role}
            </span>
            <Link href="/logout" className="btn btn-secondary btn-sm">
              Log out
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
