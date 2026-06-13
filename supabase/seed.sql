-- Mahir'sClass — default teacher account (idempotent). Run AFTER schema.sql.
-- Login: teacher@example.com / teacher123   (change the password after first login)

insert into users (name, email, password_hash, role)
select 'Teacher', 'teacher@example.com', '$2a$10$ixeYbCaeBqXTSqzSBbvrDusRNZ5xVSN8aKuvCQcYRarPWoIIy2vvW', 'teacher'
where not exists (select 1 from users where role = 'teacher');
