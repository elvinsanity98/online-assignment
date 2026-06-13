-- Mahir'sClass — Supabase (PostgreSQL) schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists users (
  id            bigint generated always as identity primary key,
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'student' check (role in ('teacher', 'student')),
  created_at    timestamptz not null default now()
);

create table if not exists assignments (
  id          bigint generated always as identity primary key,
  teacher_id  bigint not null references users(id) on delete cascade,
  title       text not null,
  description text,
  due_date    timestamptz,
  is_open     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists questions (
  id            bigint generated always as identity primary key,
  assignment_id bigint not null references assignments(id) on delete cascade,
  question_text text not null,
  points        integer not null default 10,
  position      integer not null default 0
);

create table if not exists submissions (
  id            bigint generated always as identity primary key,
  assignment_id bigint not null references assignments(id) on delete cascade,
  student_id    bigint not null references users(id) on delete cascade,
  submitted_at  timestamptz not null default now(),
  grade         text,
  feedback      text,
  total_score   numeric(7,2),
  max_score     numeric(7,2),
  percentage    numeric(5,2),
  is_graded     boolean not null default false,
  unique (assignment_id, student_id)
);

create table if not exists answers (
  id            bigint generated always as identity primary key,
  submission_id bigint not null references submissions(id) on delete cascade,
  question_id   bigint not null references questions(id) on delete cascade,
  answer_text   text,
  score         numeric(6,2)
);

create index if not exists idx_assignments_teacher on assignments(teacher_id);
create index if not exists idx_questions_assignment on questions(assignment_id);
create index if not exists idx_submissions_assignment on submissions(assignment_id);
create index if not exists idx_submissions_student on submissions(student_id);
create index if not exists idx_answers_submission on answers(submission_id);

-- Note: this app talks to Supabase only from the server using the service_role key,
-- which bypasses Row Level Security. RLS is left disabled for simplicity. If you later
-- add browser-side access with the anon key, enable RLS and add policies first.
