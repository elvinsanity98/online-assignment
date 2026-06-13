import { createClass } from '@/actions/classes';
import ClassForm from '@/components/ClassForm';

export const dynamic = 'force-dynamic';

export default function NewClassPage({ searchParams }) {
  return (
    <ClassForm
      action={createClass}
      heading="New Class"
      submitLabel="Create class"
      error={searchParams?.error}
    />
  );
}
