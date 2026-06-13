'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';
import { isAnswerable } from '@/lib/grading';

export async function submitAnswers(formData) {
  const user = await requireRole('student');
  const sb = supabase();

  const assignmentId = Number(formData.get('assignment_id') || 0);

  const { data: assignment } = await sb
    .from('assignments').select('*').eq('id', assignmentId).maybeSingle();
  if (!assignment) redirect('/student/dashboard?error=' + encodeURIComponent('Assignment not found.'));
  if (!isAnswerable(assignment)) {
    redirect('/student/dashboard?error=' + encodeURIComponent('This assignment is not open for answering.'));
  }

  // One submission per student per assignment.
  const { data: existing } = await sb
    .from('submissions').select('id').eq('assignment_id', assignmentId).eq('student_id', user.id).maybeSingle();
  if (existing) {
    redirect('/student/dashboard?info=' + encodeURIComponent('You have already submitted this assignment.'));
  }

  const { data: questions } = await sb
    .from('questions').select('id').eq('assignment_id', assignmentId).order('position', { ascending: true });

  const answers = [];
  let missing = false;
  for (const q of questions || []) {
    const text = String(formData.get(`answers_${q.id}`) || '').trim();
    if (!text) { missing = true; break; }
    answers.push({ question_id: q.id, answer_text: text });
  }
  if (missing) {
    redirect(`/student/answer/${assignmentId}?error=` +
      encodeURIComponent('Please answer every question before submitting.'));
  }

  const { data: created, error } = await sb
    .from('submissions').insert({ assignment_id: assignmentId, student_id: user.id })
    .select('id').single();
  if (error || !created) {
    redirect('/student/dashboard?error=' +
      encodeURIComponent('Could not submit — you may have already submitted this assignment.'));
  }

  const rows = answers.map((ans) => ({ ...ans, submission_id: created.id }));
  await sb.from('answers').insert(rows);

  revalidatePath('/student/dashboard');
  redirect('/student/dashboard?success=' + encodeURIComponent('Your answers have been submitted!'));
}
