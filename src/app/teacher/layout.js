import { requireRole } from '@/lib/auth';
import Nav from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({ children }) {
  const user = await requireRole('teacher');
  return (
    <>
      <Nav user={user} />
      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </>
  );
}
