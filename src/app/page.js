import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser, homePathFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: '🗂️',
    title: 'Teacher controls everything',
    text: 'Create assignments and open or close each one whenever you like. Students only see what you allow.',
  },
  {
    icon: '✍️',
    title: 'Students answer online',
    text: 'Open assignments appear on each student’s dashboard. They answer once, from any device.',
  },
  {
    icon: '🎯',
    title: 'Automatic grading',
    text: 'Set points per question. Scores, percentages, and letter grades are calculated for you.',
  },
];

export default async function Home() {
  const user = await currentUser();
  if (user) redirect(homePathFor(user));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">Mahir&apos;s<span className="text-brand">Class</span></span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-secondary btn-sm">Log in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            The simple way to run class assignments
          </h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Mahir&apos;sClass lets a teacher post assignments, decide exactly which ones are open,
            and grade student answers — all in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn bg-white text-brand hover:bg-indigo-50 px-6 py-3">
              Create a student account
            </Link>
            <Link href="/login" className="btn border border-white text-white hover:bg-white/10 px-6 py-3">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-16 grid gap-6 sm:grid-cols-3 flex-1">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-6 text-sm text-slate-500 flex items-center justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Mahir&apos;sClass</span>
          <span>
            Teacher? <Link href="/login" className="text-brand font-semibold">Log in here</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
