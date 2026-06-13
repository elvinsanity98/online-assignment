import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getClassStudents } from '@/lib/classData';
import { addMember, removeMember } from '@/actions/classes';
import { FlashFromParams } from '@/components/Alert';
import ClassMap from '@/components/ClassMap';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

export default async function ClassDetailPage({ params, searchParams }) {
  const user = await requireRole('teacher');
  const id = Number(params.id);
  const sb = supabase();

  const { data: klass } = await sb
    .from('classes').select('*').eq('id', id).eq('teacher_id', user.id).maybeSingle();
  if (!klass) redirect('/teacher/classes?error=' + encodeURIComponent('Class not found.'));

  const students = await getClassStudents(id);
  const memberIds = new Set(students.map((s) => s.id));

  // Students not yet in this class, for the quick-add dropdown.
  const { data: allStudents } = await sb
    .from('users').select('id, name, email').eq('role', 'student').order('name');
  const available = (allStudents || []).filter((s) => !memberIds.has(s.id));

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: klass.color }} />
          <div>
            <h1 className="text-2xl font-bold">{klass.name}</h1>
            {klass.description && <p className="text-slate-500 text-sm mt-0.5">{klass.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/teacher/classes/${id}/edit`} className="btn btn-secondary">Edit class</Link>
          <Link href="/teacher/classes" className="btn btn-secondary">← Back</Link>
        </div>
      </div>

      <FlashFromParams searchParams={searchParams} />

      <p className="text-sm text-slate-500 mb-3">
        Class map — hover (or tap) a student to see their status and recent activity.
      </p>
      <ClassMap klass={klass} students={students} />

      {/* Roster management */}
      <h2 className="text-xl font-bold mt-10 mb-3">Manage students</h2>

      <div className="card mb-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Add from the list of existing students */}
          <form action={addMember} className="space-y-2">
            <label className="label">Add an existing student</label>
            <input type="hidden" name="class_id" value={id} />
            <div className="flex gap-2">
              <select className="input" name="student_id" defaultValue="" required={false}>
                <option value="">— choose a student —</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
            {available.length === 0 && (
              <p className="text-xs text-slate-400">All registered students are already in this class.</p>
            )}
          </form>

          {/* Add by email */}
          <form action={addMember} className="space-y-2">
            <label className="label">…or add by email</label>
            <input type="hidden" name="class_id" value={id} />
            <div className="flex gap-2">
              <input className="input" type="email" name="email" placeholder="student@example.com" />
              <button type="submit" className="btn btn-secondary">Add</button>
            </div>
            <p className="text-xs text-slate-400">The student must already have an account.</p>
          </form>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Current students ({students.length})</h3>
        {students.length === 0 ? (
          <p className="text-slate-400 text-sm">No students yet — add some above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {students.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2">
                <Avatar emoji={s.avatar_emoji} color={s.avatar_color} name={s.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{s.name}</div>
                  <div className="text-xs text-slate-400 truncate">{s.email}</div>
                </div>
                <form action={removeMember}>
                  <input type="hidden" name="class_id" value={id} />
                  <input type="hidden" name="student_id" value={s.id} />
                  <button type="submit" className="btn btn-secondary btn-sm">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
