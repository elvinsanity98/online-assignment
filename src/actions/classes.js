'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

// Confirms the class exists and belongs to this teacher; returns it or redirects.
async function ownedClass(sb, classId, teacherId) {
  const { data } = await sb
    .from('classes').select('*').eq('id', classId).eq('teacher_id', teacherId).maybeSingle();
  return data;
}

export async function createClass(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const color = String(formData.get('color') || '#4f46e5').slice(0, 16) || '#4f46e5';

  if (!name) redirect('/teacher/classes/new?error=' + encodeURIComponent('Please enter a class name.'));

  const { data: created, error } = await sb
    .from('classes')
    .insert({ teacher_id: user.id, name, description: description || null, color })
    .select('id').single();
  if (error || !created) {
    redirect('/teacher/classes/new?error=' + encodeURIComponent('Could not create the class.'));
  }

  revalidatePath('/teacher/classes');
  redirect(`/teacher/classes/${created.id}?success=` + encodeURIComponent('Class created. Add students below.'));
}

export async function updateClass(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const id = Number(formData.get('id') || 0);
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const color = String(formData.get('color') || '#4f46e5').slice(0, 16) || '#4f46e5';

  const klass = await ownedClass(sb, id, user.id);
  if (!klass) redirect('/teacher/classes?error=' + encodeURIComponent('Class not found.'));
  if (!name) redirect(`/teacher/classes/${id}/edit?error=` + encodeURIComponent('Please enter a class name.'));

  await sb.from('classes').update({ name, description: description || null, color }).eq('id', id);

  revalidatePath('/teacher/classes');
  revalidatePath(`/teacher/classes/${id}`);
  redirect(`/teacher/classes/${id}?success=` + encodeURIComponent('Class updated.'));
}

export async function deleteClass(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();
  const id = Number(formData.get('id') || 0);

  await sb.from('classes').delete().eq('id', id).eq('teacher_id', user.id);

  revalidatePath('/teacher/classes');
  redirect('/teacher/classes?success=' + encodeURIComponent('Class deleted.'));
}

export async function addMember(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const classId = Number(formData.get('class_id') || 0);
  const studentIdRaw = Number(formData.get('student_id') || 0);
  const email = String(formData.get('email') || '').trim();

  const klass = await ownedClass(sb, classId, user.id);
  if (!klass) redirect('/teacher/classes?error=' + encodeURIComponent('Class not found.'));

  const back = (msg, ok = false) =>
    `/teacher/classes/${classId}?` + (ok ? 'success=' : 'error=') + encodeURIComponent(msg);

  // Resolve the student either by dropdown (student_id) or by typed email.
  let studentId = studentIdRaw;
  if (!studentId) {
    if (!email) redirect(back('Enter a student email or pick one from the list.'));
    const { data: found } = await sb
      .from('users').select('id, role').eq('email', email).maybeSingle();
    if (!found || found.role !== 'student') {
      redirect(back('No student account found with that email.'));
    }
    studentId = found.id;
  }

  const { error } = await sb.from('class_members').insert({ class_id: classId, student_id: studentId });
  if (error) {
    // Unique constraint => already a member.
    redirect(back('That student is already in this class.'));
  }

  revalidatePath(`/teacher/classes/${classId}`);
  redirect(back('Student added to the class.', true));
}

export async function removeMember(formData) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const classId = Number(formData.get('class_id') || 0);
  const studentId = Number(formData.get('student_id') || 0);

  const klass = await ownedClass(sb, classId, user.id);
  if (!klass) redirect('/teacher/classes?error=' + encodeURIComponent('Class not found.'));

  await sb.from('class_members').delete().eq('class_id', classId).eq('student_id', studentId);

  revalidatePath(`/teacher/classes/${classId}`);
  redirect(`/teacher/classes/${classId}?success=` + encodeURIComponent('Student removed from the class.'));
}
