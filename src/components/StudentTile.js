'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { formatDate } from '@/lib/grading';

export default function StudentTile({ student }) {
  const [open, setOpen] = useState(false);

  const activity = student.lastActive
    ? `Last submitted ${formatDate(student.lastActive)}`
    : 'No submissions yet';

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col items-center gap-1 focus:outline-none"
      >
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 hover:border-brand transition">
          <Avatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.name} size={48} />
        </div>
        <span className="text-xs text-slate-700 max-w-[5.5rem] truncate">{student.name}</span>
        {student.status ? (
          <span className="flex items-center gap-1 text-[10px] text-green-600 max-w-[5.5rem] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            {student.status}
          </span>
        ) : null}
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Avatar emoji={student.avatar_emoji} color={student.avatar_color} name={student.name} size={36} />
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{student.name}</div>
              <div className="text-xs text-slate-400 truncate">{student.email}</div>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div>
              <span className="font-semibold text-slate-500">Status: </span>
              {student.status ? student.status : <span className="text-slate-400">Not set</span>}
            </div>
            <div className="text-slate-600">{activity}</div>
            <div className="text-slate-500">{student.submissionCount} submission(s)</div>
            {student.bio ? (
              <p className="mt-2 text-slate-500 border-t border-slate-100 pt-2 whitespace-pre-wrap">{student.bio}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
