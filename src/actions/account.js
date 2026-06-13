'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { requireLogin } from '@/lib/auth';

export async function changePassword(formData) {
  const user = await requireLogin();

  const current = String(formData.get('current_password') || '');
  const next = String(formData.get('new_password') || '');
  const confirm = String(formData.get('confirm_password') || '');

  const back = (msg, ok = false) =>
    '/account/password?' + (ok ? 'success=' : 'error=') + encodeURIComponent(msg);

  if (!current || !next) redirect(back('Please fill in all fields.'));
  if (next.length < 6) redirect(back('New password must be at least 6 characters.'));
  if (next !== confirm) redirect(back('New passwords do not match.'));

  const sb = supabase();
  const { data: row } = await sb.from('users').select('password_hash').eq('id', user.id).maybeSingle();
  if (!row || !bcrypt.compareSync(current, row.password_hash)) {
    redirect(back('Your current password is incorrect.'));
  }

  const hash = bcrypt.hashSync(next, 10);
  const { error } = await sb.from('users').update({ password_hash: hash }).eq('id', user.id);
  if (error) redirect(back('Could not update your password. Please try again.'));

  redirect(back('Password changed successfully.', true));
}
