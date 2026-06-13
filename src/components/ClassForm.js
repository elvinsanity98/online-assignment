'use client';

import { useState } from 'react';
import Link from 'next/link';
import Alert from './Alert';
import { CLASS_COLORS } from '@/lib/avatars';

export default function ClassForm({
  action,
  heading,
  submitLabel,
  error,
  klass = { id: 0, name: '', description: '', color: '#4f46e5' },
}) {
  const [color, setColor] = useState(klass.color || '#4f46e5');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <Link href="/teacher/classes" className="btn btn-secondary">← Back</Link>
      </div>

      <Alert type="error" message={error} />

      <form action={action} className="card space-y-5">
        <input type="hidden" name="id" value={klass.id || 0} />
        <input type="hidden" name="color" value={color} />

        <div>
          <label className="label" htmlFor="name">Class name</label>
          <input className="input" id="name" name="name" type="text" defaultValue={klass.name} required autoFocus />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea className="input" id="description" name="description" rows={2} defaultValue={klass.description} />
        </div>

        <div>
          <label className="label">Class color</label>
          <div className="flex flex-wrap gap-2">
            {CLASS_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full border-2 shadow transition ${
                  color === c ? 'border-slate-800 scale-110' : 'border-white'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
          <Link href="/teacher/classes" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
