import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { saveAssignment } from '@/actions/assignments';
import AssignmentForm from '@/components/AssignmentForm';
import { toLocalInput } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function EditAssignmentPage({ params, searchParams }) {
  const user = await requireRole('teacher');
  const id = Number(params.id);
  const sb = supabase();

  const { data: a } = await sb
    .from('assignments').select('*').eq('id', id).eq('teacher_id', user.id).maybeSingle();
  if (!a) redirect('/teacher/dashboard?error=' + encodeURIComponent('Assignment not found.'));

  const { data: questions } = await sb
    .from('questions').select('question_text, points').eq('assignment_id', id)
    .order('position', { ascending: true });

  return (
    <AssignmentForm
      action={saveAssignment}
      heading="Edit Assignment"
      submitLabel="Save changes"
      error={searchParams?.error}
      assignment={{
        id: a.id,
        title: a.title,
        description: a.description || '',
        is_open: a.is_open,
        dueLocal: toLocalInput(a.due_date),
      }}
      questions={questions && questions.length ? questions : [{ question_text: '', points: 10 }]}
    />
  );
}
