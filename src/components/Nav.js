import Link from 'next/link';
import { homePathFor } from '@/lib/auth';

export default function Nav({ user }) {
  const links = !user
    ? []
    : user.role === 'teacher'
      ? [['/teacher/dashboard', 'Assignments'], ['/teacher/classes', 'Classes']]
      : [['/student/dashboard', 'Assignments'], ['/student/classes', 'Classes']];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={homePathFor(user)} className="font-bold text-lg no-underline text-slate-800 shrink-0">
            Mahir&apos;s<span className="text-brand">Class</span>
          </Link>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm text-slate-600 hover:text-brand no-underline">
              {label}
            </Link>
          ))}
        </div>

        {user && (
          <div className="flex items-center gap-2 text-sm flex-wrap justify-end">
            <span className="hidden sm:inline text-slate-600 max-w-[10rem] truncate">{user.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold capitalize">
              {user.role}
            </span>
            <Link href="/account/profile" className="btn btn-secondary btn-sm">Profile</Link>
            <Link href="/logout" className="btn btn-secondary btn-sm">Log out</Link>
          </div>
        )}
      </div>
    </header>
  );
}
