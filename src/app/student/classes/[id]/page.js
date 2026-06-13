import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getClassStudents } from '@/lib/classData';
import ClassMap from '@/components/ClassMap';

export const dynamic = 'force-dynamic';

export default async function StudentClassMapPage({ params }) {
  const user = await requireRole('student');
  const id = Number(params.id);
  const sb = supabase();

  // Must be a member of this class to view it.
  const { data: membership } = await sb
    .from('class_members').select('id').eq('class_id', id).eq('student_id', user.id).maybeSingle();
  if (!membership) redirect('/student/classes?error=' + encodeURIComponent('Class not found.'));

  const { data: klass } = await sb.from('classes').select('*').eq('id', id).maybeSingle();
  if (!klass) redirect('/student/classes?error=' + encodeURIComponent('Class not found.'));

  const students = await getClassStudents(id);

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
        <Link href="/student/classes" className="btn btn-secondary">← Back</Link>
      </div>

      <p className="text-sm text-slate-500 mb-3">
        Class map — hover (or tap) a classmate to see their status and recent activity.
      </p>
      <ClassMap klass={klass} students={students} />
    </div>
  );
}
