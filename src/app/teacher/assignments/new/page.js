import { saveAssignment } from '@/actions/assignments';
import AssignmentForm from '@/components/AssignmentForm';

export const dynamic = 'force-dynamic';

export default function NewAssignmentPage({ searchParams }) {
  return (
    <AssignmentForm
      action={saveAssignment}
      heading="New Assignment"
      submitLabel="Create assignment"
      error={searchParams?.error}
    />
  );
}
