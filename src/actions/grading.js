'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';
import { letterGrade, num } from '@/lib/grading';

export async function saveGrade(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const assignmentId = Number(formData.get('assignment_id') || 0);
  const submissionId = Number(formData.get('submission_id') || 0);
  const feedback = String(formData.get('feedback') || '').trim();

  // Assignment must belong to this teacher.
  const { data: a } = await sb
    .from('assignments').select('id').eq('id', assignmentId).eq('teacher_id', user.id).maybeSingle();
  if (!a) redirect('/teacher/dashboard?error=' + encodeURIComponent('Assignment not found.'));

  // Submission must belong to this assignment.
  const { data: sub } = await sb
    .from('submissions').select('id').eq('id', submissionId).eq('assignment_id', assignmentId).maybeSingle();
  if (!sub) redirect(`/teacher/submissions/${assignmentId}?error=` + encodeURIComponent('Submission not found.'));

  const { data: questions } = await sb
    .from('questions').select('id, points').eq('assignment_id', assignmentId);

  let total = 0;
  let max = 0;
  for (const q of questions || []) {
    const maxPts = Number(q.points) || 0;
    max += maxPts;

    const raw = formData.get(`scores_${q.id}`);
    let score = raw === null || String(raw).trim() === '' ? 0 : Number(raw);
    if (Number.isNaN(score) || score < 0) score = 0;
    if (score > maxPts) score = maxPts; // clamp to the question's max
    total += score;

    await sb.from('answers').update({ score }).eq('submission_id', submissionId).eq('question_id', q.id);
  }

  const pct = max > 0 ? Math.round((total / max) * 10000) / 100 : 0;
  const letter = letterGrade(pct);

  await sb.from('submissions').update({
    total_score: total,
    max_score: max,
    percentage: pct,
    grade: letter,
    feedback: feedback || null,
    is_graded: true,
  }).eq('id', submissionId);

  revalidatePath(`/teacher/submissions/${assignmentId}`);
  redirect(`/teacher/submissions/${assignmentId}?success=` +
    encodeURIComponent(`Grade saved: ${num(total)}/${num(max)} (${num(pct)}% · ${letter}).`));
}
