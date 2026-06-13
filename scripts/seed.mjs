// Seeds a default teacher account (run once after creating the schema).
//   npm run seed
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: existing, error: selErr } = await sb
  .from('users')
  .select('id')
  .eq('role', 'teacher')
  .limit(1);

if (selErr) {
  console.error('Could not query users. Did you run supabase/schema.sql?');
  console.error(selErr.message);
  process.exit(1);
}

if (existing && existing.length > 0) {
  console.log('A teacher account already exists — skipping.');
  process.exit(0);
}

const passwordHash = bcrypt.hashSync('teacher123', 10);
const { error: insErr } = await sb.from('users').insert({
  name: 'Teacher',
  email: 'teacher@example.com',
  password_hash: passwordHash,
  role: 'teacher',
});

if (insErr) {
  console.error('Failed to create teacher account:', insErr.message);
  process.exit(1);
}

console.log('✅ Created default teacher account:');
console.log('   Email:    teacher@example.com');
console.log('   Password: teacher123');
console.log('   (Change this password after logging in.)');
