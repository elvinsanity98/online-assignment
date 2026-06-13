import 'server-only';
import { supabase } from './supabase';

// Returns the students in a class, each enriched with submission activity,
// sorted by name. Shape matches what <StudentTile> expects.
export async function getClassStudents(classId) {
  const sb = supabase();

  const { data: members } = await sb
    .from('class_members').select('student_id').eq('class_id', classId);
  const ids = (members || []).map((m) => m.student_id);
  if (ids.length === 0) return [];

  const { data: users } = await sb
    .from('users')
    .select('id, name, email, avatar_emoji, avatar_color, bio, status, status_updated_at')
    .in('id', ids);

  const { data: subs } = await sb
    .from('submissions').select('student_id, submitted_at').in('student_id', ids);

  const agg = {};
  (subs || []).forEach((s) => {
    const a = agg[s.student_id] || { count: 0, last: null };
    a.count += 1;
    if (!a.last || new Date(s.submitted_at) > new Date(a.last)) a.last = s.submitted_at;
    agg[s.student_id] = a;
  });

  return (users || [])
    .map((u) => ({
      ...u,
      submissionCount: agg[u.id]?.count || 0,
      lastActive: agg[u.id]?.last || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
