'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { createSession } from '@/lib/session';

export async function loginAction(formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Please enter your email and password.'));
  }

  const { data: user, error } = await supabase()
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    redirect('/login?error=' + encodeURIComponent('Login failed — check the database connection.'));
  }
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    redirect('/login?error=' + encodeURIComponent('Incorrect email or password.'));
  }

  await createSession({ id: user.id, name: user.name, role: user.role });
  redirect(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
}

export async function registerAction(formData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  const back = (msg) =>
    '/register?error=' +
    encodeURIComponent(msg) +
    '&name=' + encodeURIComponent(name) +
    '&email=' + encodeURIComponent(email);

  if (!name || !email || !password) redirect(back('Please fill in all fields.'));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect(back('Please enter a valid email address.'));
  if (password.length < 6) redirect(back('Password must be at least 6 characters.'));
  if (password !== confirm) redirect(back('Passwords do not match.'));

  const sb = supabase();
  const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) redirect(back('An account with that email already exists.'));

  const hash = bcrypt.hashSync(password, 10);
  const { error } = await sb
    .from('users')
    .insert({ name, email, password_hash: hash, role: 'student' });

  if (error) redirect(back('Could not create the account. Please try again.'));

  redirect('/login?success=' + encodeURIComponent('Account created! You can now log in.'));
}
