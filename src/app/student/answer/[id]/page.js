import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { submitAnswers } from '@/actions/submissions';
import Alert from '@/components/Alert';
import { num, formatDate, isAnswerable } from '@/lib/grading';

export const dynamic = 'force-dynamic';

export default async function AnswerPage({ params, searchParams }) {
  const user = await requireRole('student');
  const id = Number(params.id);
  const sb = supabase();

  const { data: assignment } = await sb.from('assignments').select('*').eq('id', id).maybeSingle();
  if (!assignment) redirect('/student/dashboard?error=' + encodeURIComponent('Assignment not found.'));
  if (!isAnswerable(assignment)) {
    redirect('/student/dashboard?error=' + encodeURIComponent('This assignment is not open for answering.'));
  }

  const { data: existing } = await sb
    .from('submissions').select('id').eq('assignment_id', id).eq('student_id', user.id).maybeSingle();
  if (existing) {
    redirect('/student/dashboard?info=' + encodeURIComponent('You have already submitted this assignment.'));
  }

  const { data: questions } = await sb
    .from('questions').select('id, question_text, points').eq('assignment_id', id)
    .order('position', { ascending: true });
  const qList = questions || [];
  const totalPoints = qList.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Worth {num(totalPoints)} points total
            {assignment.due_date && <> · Due {formatDate(assignment.due_date)}</>}
          </p>
        </div>
        <Link href="/student/dashboard" className="btn btn-secondary">← Back</Link>
      </div>

      {assignment.description && (
        <div className="rounded-lg px-4 py-3 mb-5 text-sm bg-sky-100 text-sky-800 whitespace-pre-wrap">
          {assignment.description}
        </div>
      )}

      <Alert type="error" message={searchParams?.error} />

      {qList.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          <p>This assignment has no questions yet.</p>
        </div>
      ) : (
        <form action={submitAnswers} className="card space-y-5">
          <input type="hidden" name="assignment_id" value={assignment.id} />

          {qList.map((q, i) => (
            <div key={q.id} className="border-l-2 border-brand pl-4">
              <div className="font-semibold">
                Question {i + 1} <span className="text-slate-400 font-normal">({num(q.points)} pts)</span>
              </div>
              <p className="my-2 whitespace-pre-wrap">{q.question_text}</p>
              <textarea
                className="input" name={`answers_${q.id}`} rows={4}
                placeholder="Your answer..." required
              />
            </div>
          ))}

          <div className="rounded-lg px-4 py-3 text-sm bg-amber-100 text-amber-800">
            You can only submit once. Review your answers before sending.
          </div>

          <div className="flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary">Submit answers</button>
            <Link href="/student/dashboard" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
