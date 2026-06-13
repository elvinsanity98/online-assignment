import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toggleAssignment, deleteAssignment } from '@/actions/assignments';
import { FlashFromParams } from '@/components/Alert';
import ConfirmButton from '@/components/ConfirmButton';
import { formatDate } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboard({ searchParams }) {
  const user = await requireRole('teacher');
  const sb = supabase();

  const { data: assignments } = await sb
    .from('assignments').select('*').eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  const ids = (assignments || []).map((a) => a.id);
  const qCounts = {};
  const sCounts = {};
  const gradedAgg = {}; // assignment_id -> { sum, n }
  let totalSubs = 0;
  let overallGradedSum = 0;
  let overallGradedN = 0;
  if (ids.length) {
    const { data: qs } = await sb.from('questions').select('assignment_id').in('assignment_id', ids);
    (qs || []).forEach((q) => { qCounts[q.assignment_id] = (qCounts[q.assignment_id] || 0) + 1; });

    const { data: ss } = await sb
      .from('submissions').select('assignment_id, is_graded, percentage').in('assignment_id', ids);
    (ss || []).forEach((s) => {
      sCounts[s.assignment_id] = (sCounts[s.assignment_id] || 0) + 1;
      totalSubs += 1;
      if (s.is_graded) {
        const g = gradedAgg[s.assignment_id] || { sum: 0, n: 0 };
        g.sum += Number(s.percentage) || 0;
        g.n += 1;
        gradedAgg[s.assignment_id] = g;
        overallGradedSum += Number(s.percentage) || 0;
        overallGradedN += 1;
      }
    });
  }
  const round1 = (x) => Math.round(x * 10) / 10;
  const overallAvg = overallGradedN ? round1(overallGradedSum / overallGradedN) : null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <Link href="/teacher/assignments/new" className="btn btn-primary">+ New Assignment</Link>
      </div>

      <FlashFromParams searchParams={searchParams} />

      {(!assignments || assignments.length === 0) ? (
        <div className="card text-center py-12 text-slate-500">
          <div className="text-4xl mb-2">📝</div>
          <p className="mb-4">You haven&apos;t created any assignments yet.</p>
          <Link href="/teacher/assignments/new" className="btn btn-primary">Create your first assignment</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold">{assignments.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Assignments</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold">{totalSubs}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Submissions</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold">{overallAvg !== null ? `${overallAvg}%` : '—'}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Class average</div>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => {
            const open = a.is_open === true;
            const overdue = a.due_date && new Date(a.due_date).getTime() < Date.now();
            const qc = qCounts[a.id] || 0;
            const sc = sCounts[a.id] || 0;
            return (
              <div key={a.id} className="card flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <span className={`pill ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <p className="text-sm text-slate-500 flex-1 my-2 whitespace-pre-wrap">
                  {a.description || <span className="text-slate-400">No description</span>}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                  <span>{qc} question(s)</span>
                  <span>{sc} submission(s)</span>
                  {gradedAgg[a.id] && (
                    <span className="pill bg-sky-100 text-sky-700">
                      Avg {round1(gradedAgg[a.id].sum / gradedAgg[a.id].n)}% ({gradedAgg[a.id].n} graded)
                    </span>
                  )}
                  {a.due_date && (
                    <span className={overdue ? 'pill bg-amber-100 text-amber-700' : ''}>
                      Due {formatDate(a.due_date)}
                    </span>
                  )}
                </div>

                <form action={toggleAssignment} className="mb-2">
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className={`btn btn-sm w-full ${open ? 'btn-warning' : 'btn-success'}`}
                  >
                    {open ? 'Close (stop answers)' : 'Open for answers'}
                  </button>
                </form>

                <div className="flex gap-2 flex-wrap">
                  <Link href={`/teacher/submissions/${a.id}`} className="btn btn-secondary btn-sm">
                    View answers ({sc})
                  </Link>
                  <Link href={`/teacher/assignments/${a.id}/edit`} className="btn btn-secondary btn-sm">
                    Edit
                  </Link>
                  <form action={deleteAssignment}>
                    <input type="hidden" name="id" value={a.id} />
                    <ConfirmButton
                      className="btn btn-danger btn-sm"
                      message="Delete this assignment and all its answers? This cannot be undone."
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
