import Link from 'next/link';
import { requireLogin, homePathFor } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { updateProfile } from '@/actions/account';
import ProfileForm from '@/components/ProfileForm';
import Alert from '@/components/Alert';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ searchParams }) {
  const user = await requireLogin();
  const sb = supabase();

  const { data: profile } = await sb
    .from('users')
    .select('name, role, avatar_emoji, avatar_color, bio, status')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My profile</h1>
        <Link href={homePathFor(user)} className="btn btn-secondary">← Back</Link>
      </div>

      <Alert type="error" message={searchParams?.error} />
      <Alert type="success" message={searchParams?.success} />

      <ProfileForm action={updateProfile} profile={profile || { name: user.name, role: user.role }} />

      <div className="mt-4 text-sm text-slate-500">
        Want to change your password?{' '}
        <Link href="/account/password" className="text-brand font-semibold">Change password</Link>
      </div>
    </div>
  );
}
