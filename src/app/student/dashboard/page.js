import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { FlashFromParams } from '@/components/Alert';
import { num, formatDate, gradePillClass } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function StudentDashboard({ searchParams }) {
  const user = await requireRole('student');
  const sb = supabase();

  // Already-submitted work (with assignment titles).
  const { data: subsRaw } = await sb
    .from('submissions').select('*').eq('student_id', user.id)
    .order('submitted_at', { ascending: false });
  const submitted = subsRaw || [];

  const submittedIds = submitted.map((s) => s.assignment_id);
  const titleById = {};
  if (submittedIds.length) {
    const { data: as } = await sb.from('assignments').select('id, title').in('id', submittedIds);
    (as || []).forEach((a) => { titleById[a.id] = a.title; });
  }

  // Open assignments not yet submitted and not past due.
  const { data: openRaw } = await sb
    .from('assignments').select('*').eq('is_open', true)
    .order('created_at', { ascending: false });
  const now = Date.now();
  const open = (openRaw || []).filter(
    (a) => !submittedIds.includes(a.id) && (!a.due_date || new Date(a.due_date).getTime() >= now)
  );

  // Question counts for the open assignments.
  const qCounts = {};
  const openIds = open.map((a) => a.id);
  if (openIds.length) {
    const { data: qs } = await sb.from('questions').select('assignment_id').in('assignment_id', openIds);
    (qs || []).forEach((q) => { qCounts[q.assignment_id] = (qCounts[q.assignment_id] || 0) + 1; });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Assignments</h1>

      <FlashFromParams searchParams={searchParams} />

      {open.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          <div className="text-4xl mb-2">✅</div>
          <p>There are no assignments open for you right now.</p>
          <p className="text-slate-400 text-sm mt-1">
            Your teacher decides which assignments are open. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((a) => (
            <div key={a.id} className="card flex flex-col">
              <h3 className="font-semibold text-lg">{a.title}</h3>
              <p className="text-sm text-slate-500 flex-1 my-2 whitespace-pre-wrap">
                {a.description || <span className="text-slate-400">No description</span>}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                <span>{qCounts[a.id] || 0} question(s)</span>
                {a.due_date && (
                  <span className="pill bg-amber-100 text-amber-700">Due {formatDate(a.due_date)}</span>
                )}
              </div>
              <Link href={`/student/answer/${a.id}`} className="btn btn-primary w-full">Answer this</Link>
            </div>
          ))}
        </div>
      )}

      {submitted.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4">Submitted</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                  <th className="py-2 pr-3">Assignment</th>
                  <th className="py-2 pr-3">Submitted</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Grade</th>
                  <th className="py-2 pr-3">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submitted.map((s) => {
                  const graded = s.is_graded === true;
                  return (
                    <tr key={s.id} className="border-t border-slate-200">
                      <td className="py-2 pr-3">{titleById[s.assignment_id] || '—'}</td>
                      <td className="py-2 pr-3">{formatDate(s.submitted_at)}</td>
                      <td className="py-2 pr-3">
                        {graded ? (
                          <>
                            {num(s.total_score)}/{num(s.max_score)}{' '}
                            <span className="text-slate-400">({num(s.percentage)}%)</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {graded ? (
                          <span className={`pill ${gradePillClass(s.grade)}`}>{s.grade}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {s.feedback || <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
