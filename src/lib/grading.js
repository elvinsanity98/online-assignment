// Shared grading + formatting helpers (safe to use on server or client).

export const GRADE_SCALE = 'A 90-100% · B 80-89% · C 70-79% · D 60-69% · F below 60%';

export function letterGrade(percentage) {
  const p = Number(percentage);
  if (p >= 90) return 'A';
  if (p >= 80) return 'B';
  if (p >= 70) return 'C';
  if (p >= 60) return 'D';
  return 'F';
}

// Tailwind classes for a grade pill.
export function gradePillClass(letter) {
  switch (letter) {
    case 'A':
    case 'B':
      return 'bg-green-100 text-green-700';
    case 'C':
    case 'D':
      return 'bg-amber-100 text-amber-700';
    case 'F':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-sky-100 text-sky-700';
  }
}

// Trim trailing zeros: 20.00 -> "20", 17.50 -> "17.5".
export function num(value) {
  if (value === null || value === undefined || value === '') return '0';
  const n = Number(value);
  if (Number.isNaN(n)) return '0';
  return (Math.round(n * 100) / 100).toString();
}

export function formatDate(datetime) {
  if (!datetime) return '—';
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Convert a timestamptz into the value a <input type="datetime-local"> expects.
export function toLocalInput(datetime) {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isAnswerable(assignment) {
  if (!assignment || assignment.is_open !== true) return false;
  if (assignment.due_date && new Date(assignment.due_date).getTime() < Date.now()) return false;
  return true;
}
