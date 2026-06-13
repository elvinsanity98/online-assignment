import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { updateClass } from '@/actions/classes';
import ClassForm from '@/components/ClassForm';

export const dynamic = 'force-dynamic';

export default async function EditClassPage({ params, searchParams }) {
  const user = await requireRole('teacher');
  const id = Number(params.id);
  const sb = supabase();

  const { data: klass } = await sb
    .from('classes').select('*').eq('id', id).eq('teacher_id', user.id).maybeSingle();
  if (!klass) redirect('/teacher/classes?error=' + encodeURIComponent('Class not found.'));

  return (
    <ClassForm
      action={updateClass}
      heading="Edit Class"
      submitLabel="Save changes"
      error={searchParams?.error}
      klass={{ id: klass.id, name: klass.name, description: klass.description || '', color: klass.color }}
    />
  );
}
