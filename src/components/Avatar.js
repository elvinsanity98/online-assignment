// Renders a circular avatar: an emoji on a colored background.
// Server-safe (no hooks) so it can be used anywhere.
export default function Avatar({ emoji = '🙂', color = '#4f46e5', name, size = 48 }) {
  return (
    <div
      title={name || ''}
      style={{ width: size, height: size, backgroundColor: color }}
      className="rounded-full flex items-center justify-center text-white select-none shrink-0 shadow-sm"
    >
      <span style={{ fontSize: Math.round(size * 0.52), lineHeight: 1 }}>{emoji || '🙂'}</span>
    </div>
  );
}
