'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { AVATAR_EMOJIS, AVATAR_COLORS } from '@/lib/avatars';

export default function ProfileForm({ action, profile }) {
  const [emoji, setEmoji] = useState(profile.avatar_emoji || '🙂');
  const [color, setColor] = useState(profile.avatar_color || '#4f46e5');

  return (
    <form action={action} className="card space-y-6">
      <div className="flex items-center gap-4">
        <Avatar emoji={emoji} color={color} name={profile.name} size={72} />
        <div>
          <div className="font-semibold text-lg">{profile.name}</div>
          <div className="text-sm text-slate-500 capitalize">{profile.role}</div>
        </div>
      </div>

      <input type="hidden" name="avatar_emoji" value={emoji} />
      <input type="hidden" name="avatar_color" value={color} />

      <div>
        <label className="label">Choose an avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition ${
                emoji === e ? 'border-brand ring-2 ring-brand/30 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Background color</label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
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

      <div>
        <label className="label" htmlFor="status">Current status / activity</label>
        <input
          className="input"
          id="status"
          name="status"
          defaultValue={profile.status || ''}
          maxLength={120}
          placeholder="e.g. Working on the Math assignment"
        />
        <p className="text-xs text-slate-500 mt-1">
          Shown to others on the class map when they hover over your avatar.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="bio">
          About me <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          className="input"
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio || ''}
          maxLength={500}
          placeholder="A short description about yourself"
        />
      </div>

      <button type="submit" className="btn btn-primary">Save profile</button>
    </form>
  );
}
