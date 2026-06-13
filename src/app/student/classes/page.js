import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function StudentClassesPage() {
  const user = await requireRole('student');
  const sb = supabase();

  const { data: memberships } = await sb
    .from('class_members').select('class_id').eq('student_id', user.id);
  const ids = (memberships || []).map((m) => m.class_id);

  let classes = [];
  if (ids.length) {
    const { data } = await sb.from('classes').select('*').in('id', ids).order('name');
    classes = data || [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Classes</h1>

      {classes.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          <div className="text-4xl mb-2">🏫</div>
          <p>You haven&apos;t been added to any class yet.</p>
          <p className="text-slate-400 text-sm mt-1">Your teacher adds you to a class.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/student/classes/${c.id}`}
              className="card flex flex-col overflow-hidden no-underline text-slate-800 hover:shadow-md transition"
            >
              <div className="h-2 -mx-5 -mt-5 mb-3" style={{ backgroundColor: c.color }} />
              <h3 className="font-semibold text-lg">{c.name}</h3>
              <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">
                {c.description || <span className="text-slate-400">No description</span>}
              </p>
              <span className="text-brand text-sm font-semibold mt-3">View class map →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
