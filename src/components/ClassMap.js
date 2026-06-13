import StudentTile from './StudentTile';

// Top-view "seating map" of a class: a grid of student avatar desks.
export default function ClassMap({ klass, students }) {
  return (
    <div className="rounded-2xl border-2 p-5 bg-white" style={{ borderColor: klass.color }}>
      <div className="text-center text-xs uppercase tracking-[0.2em] text-slate-400 border-b border-dashed border-slate-200 pb-3 mb-6">
        Front of class
      </div>

      {students.length === 0 ? (
        <div className="text-center text-slate-400 py-8">No students in this class yet.</div>
      ) : (
        <div
          className="grid gap-x-4 gap-y-8 justify-items-center"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}
        >
          {students.map((s) => (
            <StudentTile key={s.id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}
