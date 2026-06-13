# Mahir'sClass — Next.js + Tailwind + Supabase

A rewrite of the PHP assignment portal using **Next.js 14 (App Router)**, **Tailwind CSS**, and **Supabase (PostgreSQL)**. Teachers create assignments and control which ones are open; students answer open assignments; teachers grade each answer and the app auto-computes score, percentage, and letter grade.

## Prerequisites

- Node.js 18.17+ (you have v20 ✓)
- A free Supabase project — https://supabase.com

## Setup (one time)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database tables**
   - In Supabase: open **SQL Editor → New query**.
   - Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

3. **Add your credentials**
   - Copy `.env.local.example` to `.env.local`.
   - In Supabase: **Project Settings → API** and copy:
     - **Project URL** → `SUPABASE_URL`
     - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY` (this is secret — server-side only)
   - Generate a `SESSION_SECRET`:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```

4. **Create the default teacher account**
   ```bash
   npm run seed
   ```
   Login: `teacher@example.com` / `teacher123` (change it after logging in).

## Run

```bash
npm run dev      # development → http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

## How it works

| Role | Can |
|------|-----|
| **Teacher** | Create/edit/delete assignments, set points per question, **open/close** each assignment, view submissions, grade per-answer (auto total + % + letter). |
| **Student** | Register, see only **open** assignments, answer once, view grade + feedback. |

## Project structure

```
src/
  app/
    login/ register/ logout/      auth
    teacher/                      teacher dashboard, assignment form, grading
    student/                      student dashboard, answer page
  actions/                        server actions (auth, assignments, grading, submissions)
  components/                     Nav, Alert, AssignmentForm, ConfirmButton
  lib/                            supabase client, session (JWT cookie), auth guards, grading helpers
supabase/schema.sql               database schema
scripts/seed.mjs                  creates the default teacher
```

## Deploying

This is a Node app — it will **not** run on plain PHP/MySQL shared hosting. Deploy to a Node host such as **Vercel** (made by the Next.js team, easiest), Render, or Railway. Set the same three environment variables there, and keep `SUPABASE_SERVICE_ROLE_KEY` secret.

## Notes

- All database access is server-side using the Supabase `service_role` key, so Row Level Security is left off for simplicity. If you ever query Supabase from the browser, enable RLS and add policies first.
- Passwords are hashed with bcrypt; logins use a signed httpOnly cookie (JWT via `jose`). Server Actions are protected against cross-site POSTs by Next.js.
