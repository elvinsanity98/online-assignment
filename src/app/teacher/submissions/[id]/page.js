import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { saveGrade, reopenSubmission } from '@/actions/grading';
import { FlashFromParams } from '@/components/Alert';
import ConfirmButton from '@/components/ConfirmButton';
import { num, formatDate, gradePillClass, GRADE_SCALE } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({ params, searchParams }) {
  const user = await requireRole('teacher');
  const id = Number(params.id);
  const sb = supabase();

  const { data: assignment } = await sb
    .from('assignments').select('*').eq('id', id).eq('teacher_id', user.id).maybeSingle();
  if (!assignment) redirect('/teacher/dashboard?error=' + encodeURIComponent('Assignment not found.'));

  const { data: questions } = await sb
    .from('questions').select('id, question_text, points, position').eq('assignment_id', id)
    .order('position', { ascending: true });
  const qList = questions || [];
  const totalPossible = qList.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  const { data: subs } = await sb
    .from('submissions').select('*').eq('assignment_id', id)
    .order('submitted_at', { ascending: false });
  const submissions = subs || [];

  // Manual joins (kept simple/robust): students + answers.
  const students = {};
  const answers = {}; // answers[submission_id][question_id] = { answer_text, score }
  if (submissions.length) {
    const studentIds = [...new Set(submissions.map((s) => s.student_id))];
    const { data: us } = await sb.from('users').select('id, name, email').in('id', studentIds);
    (us || []).forEach((u) => { students[u.id] = u; });

    const subIds = submissions.map((s) => s.id);
    const { data: ans } = await sb
      .from('answers').select('submission_id, question_id, answer_text, score').in('submission_id', subIds);
    (ans || []).forEach((row) => {
      answers[row.submission_id] = answers[row.submission_id] || {};
      answers[row.submission_id][row.question_id] = row;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submissions &amp; grading · Total possible: <strong>{num(totalPossible)} pts</strong>
          </p>
        </div>
        <Link href="/teacher/dashboard" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="rounded-lg px-4 py-3 mb-5 text-sm bg-sky-100 text-sky-800">
        Grading scale — {GRADE_SCALE}
      </div>

      <FlashFromParams searchParams={searchParams} />

      {submissions.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No students have submitted answers yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((s) => {
            const student = students[s.student_id] || {};
            const graded = s.is_graded === true;
            return (
              <div key={s.id} className="card">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{student.name || 'Unknown'}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {student.email} · Submitted {formatDate(s.submitted_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {graded ? (
                      <span className={`pill ${gradePillClass(s.grade)}`}>
                        {num(s.total_score)}/{num(s.max_score)} · {num(s.percentage)}% · {s.grade}
                      </span>
                    ) : (
                      <span className="pill bg-amber-100 text-amber-700">Not graded</span>
                    )}
                    <form action={reopenSubmission}>
                      <input type="hidden" name="assignment_id" value={assignment.id} />
                      <input type="hidden" name="submission_id" value={s.id} />
                      <ConfirmButton
                        className="btn btn-danger btn-sm"
                        message="Remove this submission so the student can answer again? Their current answers and grade will be permanently deleted."
                      >
                        Allow resubmit
                      </ConfirmButton>
                    </form>
                  </div>
                </div>

                <hr className="border-slate-200 my-4" />

                <form action={saveGrade} className="space-y-4">
                  <input type="hidden" name="assignment_id" value={assignment.id} />
                  <input type="hidden" name="submission_id" value={s.id} />

                  {qList.map((q, i) => {
                    const row = answers[s.id]?.[q.id];
                    const ansText = row?.answer_text || '';
                    const curScore = row && row.score !== null && row.score !== undefined ? num(row.score) : '';
                    return (
                      <div key={q.id}>
                        <div className="flex justify-between gap-4 items-start">
                          <div className="font-semibold text-sm">
                            Q{i + 1}. {q.question_text}{' '}
                            <span className="text-slate-400 font-normal">({num(q.points)} pts)</span>
                          </div>
                          <div className="flex items-center gap-1 flex-none">
                            <input
                              className="input w-20 text-right"
                              type="number" min={0} max={Number(q.points)} step={0.5}
                              name={`scores_${q.id}`} defaultValue={curScore} placeholder="0"
                              aria-label={`Score for question ${i + 1}`}
                            />
                            <span className="text-slate-400 text-sm">/ {num(q.points)}</span>
                          </div>
                        </div>
                        <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm whitespace-pre-wrap">
                          {ansText || <span className="text-slate-400">— no answer —</span>}
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <label className="label">
                      Feedback <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      className="input" name="feedback" rows={2}
                      defaultValue={s.feedback || ''} placeholder="Comments for the student"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    {graded ? 'Update grade' : 'Save grade'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
