import { requireLogin } from '@/lib/auth';
import Nav from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }) {
  const user = await requireLogin();
  return (
    <>
      <Nav user={user} />
      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </>
  );
}
