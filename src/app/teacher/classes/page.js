import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { deleteClass } from '@/actions/classes';
import { FlashFromParams } from '@/components/Alert';
import ConfirmButton from '@/components/ConfirmButton';

export const dynamic = 'force-dynamic';

export default async function ClassesPage({ searchParams }) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const { data: classes } = await sb
    .from('classes').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false });

  const ids = (classes || []).map((c) => c.id);
  const counts = {};
  if (ids.length) {
    const { data: m } = await sb.from('class_members').select('class_id').in('class_id', ids);
    (m || []).forEach((x) => { counts[x.class_id] = (counts[x.class_id] || 0) + 1; });
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Link href="/teacher/classes/new" className="btn btn-primary">+ New Class</Link>
      </div>

      <FlashFromParams searchParams={searchParams} />

      {(!classes || classes.length === 0) ? (
        <div className="card text-center py-12 text-slate-500">
          <div className="text-4xl mb-2">🏫</div>
          <p className="mb-4">You haven&apos;t created any classes yet.</p>
          <Link href="/teacher/classes/new" className="btn btn-primary">Create your first class</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div key={c.id} className="card flex flex-col overflow-hidden">
              <div className="h-2 -mx-5 -mt-5 mb-3" style={{ backgroundColor: c.color }} />
              <h3 className="font-semibold text-lg">{c.name}</h3>
              <p className="text-sm text-slate-500 flex-1 my-2 whitespace-pre-wrap">
                {c.description || <span className="text-slate-400">No description</span>}
              </p>
              <div className="text-xs text-slate-500 mb-3">{counts[c.id] || 0} student(s)</div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/teacher/classes/${c.id}`} className="btn btn-primary btn-sm">Open map</Link>
                <Link href={`/teacher/classes/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <form action={deleteClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton
                    className="btn btn-danger btn-sm"
                    message="Delete this class? Students stay registered, but the class and its roster are removed."
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
