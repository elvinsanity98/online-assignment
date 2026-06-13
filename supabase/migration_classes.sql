-- Mahir'sClass — migration: profiles + classes/groups
-- Run this in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.

-- 1) Profile fields on users (avatar, info, status)
alter table users add column if not exists avatar_emoji      text not null default '🙂';
alter table users add column if not exists avatar_color      text not null default '#4f46e5';
alter table users add column if not exists bio               text;
alter table users add column if not exists status            text;
alter table users add column if not exists status_updated_at timestamptz;

-- 2) Classes / groups (owned by a teacher)
create table if not exists classes (
  id          bigint generated always as identity primary key,
  teacher_id  bigint not null references users(id) on delete cascade,
  name        text not null,
  description text,
  color       text not null default '#4f46e5',
  created_at  timestamptz not null default now()
);

-- 3) Class membership (which students are in which class)
create table if not exists class_members (
  id         bigint generated always as identity primary key,
  class_id   bigint not null references classes(id) on delete cascade,
  student_id bigint not null references users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique (class_id, student_id)
);

create index if not exists idx_classes_teacher       on classes(teacher_id);
create index if not exists idx_class_members_class    on class_members(class_id);
create index if not exists idx_class_members_student  on class_members(student_id);
