'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

export async function saveAssignment(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const id = Number(formData.get('id') || 0);
  const isEdit = id > 0;
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const dueRaw = String(formData.get('due_date') || '').trim();
  const isOpen = formData.get('is_open') ? true : false;

  const qTexts = formData.getAll('questions');
  const qPoints = formData.getAll('points');

  // Pair each question with its points; drop empty rows.
  const questions = [];
  qTexts.forEach((raw, i) => {
    const text = String(raw).trim();
    if (!text) return;
    let pts = parseInt(String(qPoints[i] ?? '0'), 10);
    if (Number.isNaN(pts) || pts < 0) pts = 0;
    questions.push({ question_text: text, points: pts, position: questions.length });
  });

  const backForm = isEdit ? `/teacher/assignments/${id}/edit` : '/teacher/assignments/new';
  if (!title) redirect(backForm + '?error=' + encodeURIComponent('Please enter an assignment title.'));
  if (questions.length === 0) {
    redirect(backForm + '?error=' + encodeURIComponent('Please add at least one question.'));
  }

  const dueDate = dueRaw ? new Date(dueRaw).toISOString() : null;

  let assignmentId = id;
  if (isEdit) {
    const { data: owned } = await sb
      .from('assignments').select('id').eq('id', id).eq('teacher_id', user.id).maybeSingle();
    if (!owned) redirect('/teacher/dashboard?error=' + encodeURIComponent('Assignment not found.'));

    await sb.from('assignments')
      .update({ title, description: description || null, due_date: dueDate, is_open: isOpen })
      .eq('id', id).eq('teacher_id', user.id);

    // Replace questions wholesale (simplest reliable approach).
    await sb.from('questions').delete().eq('assignment_id', id);
  } else {
    const { data: created, error } = await sb.from('assignments')
      .insert({ teacher_id: user.id, title, description: description || null, due_date: dueDate, is_open: isOpen })
      .select('id').single();
    if (error || !created) {
      redirect(backForm + '?error=' + encodeURIComponent('Could not save the assignment.'));
    }
    assignmentId = created.id;
  }

  const rows = questions.map((q) => ({ ...q, assignment_id: assignmentId }));
  await sb.from('questions').insert(rows);

  revalidatePath('/teacher/dashboard');
  redirect('/teacher/dashboard?success=' + encodeURIComponent(isEdit ? 'Assignment updated.' : 'Assignment created.'));
}

export async function toggleAssignment(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();
  const id = Number(formData.get('id') || 0);

  const { data: a } = await sb
    .from('assignments').select('is_open').eq('id', id).eq('teacher_id', user.id).maybeSingle();
  if (!a) redirect('/teacher/dashboard?error=' + encodeURIComponent('Assignment not found.'));

  const next = !a.is_open;
  await sb.from('assignments').update({ is_open: next }).eq('id', id).eq('teacher_id', user.id);

  revalidatePath('/teacher/dashboard');
  redirect('/teacher/dashboard?success=' + encodeURIComponent(
    next ? 'Assignment is now OPEN — students can answer it.'
         : 'Assignment is now CLOSED — students can no longer answer it.'));
}

export async function deleteAssignment(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();
  const id = Number(formData.get('id') || 0);

  // Foreign keys cascade-delete questions, submissions, and answers.
  await sb.from('assignments').delete().eq('id', id).eq('teacher_id', user.id);

  revalidatePath('/teacher/dashboard');
  redirect('/teacher/dashboard?success=' + encodeURIComponent('Assignment deleted.'));
}
