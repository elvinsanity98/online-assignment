import { redirect } from 'next/navigation';
import { currentUser, homePathFor } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await currentUser();
  redirect(homePathFor(user));
}
