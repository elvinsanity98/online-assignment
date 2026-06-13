'use client';

import { useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/Alert';

let rowKey = 0;

export default function AssignmentForm({
  action,
  heading,
  submitLabel,
  error,
  assignment = { id: 0, title: '', description: '', is_open: false, dueLocal: '' },
  questions = [{ question_text: '', points: 10 }],
}) {
  const [rows, setRows] = useState(
    questions.map((q) => ({ key: rowKey++, text: q.question_text, points: q.points }))
  );

  const addRow = () => setRows((r) => [...r, { key: rowKey++, text: '', points: 10 }]);

  const removeRow = (key) =>
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));

  const updateRow = (key, patch) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <Link href="/teacher/dashboard" className="btn btn-secondary">← Back</Link>
      </div>

      <Alert type="error" message={error} />

      <form action={action} className="card space-y-5">
        <input type="hidden" name="id" value={assignment.id || 0} />

        <div>
          <label className="label" htmlFor="title">Title</label>
          <input className="input" id="title" name="title" type="text" defaultValue={assignment.title} required />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description / instructions <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea className="input" id="description" name="description" rows={3} defaultValue={assignment.description} />
        </div>

        <div>
          <label className="label" htmlFor="due_date">
            Due date <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input className="input" id="due_date" name="due_date" type="datetime-local" defaultValue={assignment.dueLocal} />
          <p className="text-xs text-slate-500 mt-1">
            After this time, students can no longer submit, even if the assignment is open.
          </p>
        </div>

        <hr className="border-slate-200" />

        <div>
          <label className="label mb-1">Questions</label>
          <p className="text-xs text-slate-500 mb-3">
            Set how many points each question is worth. Total points are calculated automatically.
          </p>

          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={row.key} className="flex gap-2 items-start">
                <textarea
                  className="input"
                  name="questions"
                  rows={2}
                  placeholder={`Question ${i + 1}...`}
                  value={row.text}
                  onChange={(e) => updateRow(row.key, { text: e.target.value })}
                />
                <div className="flex-none w-20">
                  <input
                    className="input text-center"
                    name="points"
                    type="number"
                    min={0}
                    step={1}
                    value={row.points}
                    onChange={(e) => updateRow(row.key, { points: e.target.value })}
                    aria-label="Points"
                  />
                  <div className="text-xs text-slate-500 text-center mt-1">points</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  title="Remove"
                  onClick={() => removeRow(row.key)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={addRow}>
            + Add question
          </button>
        </div>

        <hr className="border-slate-200" />

        <label className="flex items-center gap-2 font-semibold cursor-pointer">
          <input type="checkbox" name="is_open" value="1" defaultChecked={assignment.is_open} />
          Open this assignment for answering now
        </label>
        <p className="text-xs text-slate-500 -mt-3">You can open or close it any time from the dashboard.</p>

        <div className="flex gap-2 flex-wrap">
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
          <Link href="/teacher/dashboard" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
