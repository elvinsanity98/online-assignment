const STYLES = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-800',
};

export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  return (
    <div className={`rounded-lg px-4 py-3 mb-5 text-sm ${STYLES[type] || STYLES.info}`}>{message}</div>
  );
}

// Convenience: render flash from a page's searchParams (?success=.. / ?error=.. / ?info=..).
export function FlashFromParams({ searchParams }) {
  const success = searchParams?.success;
  const error = searchParams?.error;
  const info = searchParams?.info;
  const warning = searchParams?.warning;
  if (error) return <Alert type="error" message={error} />;
  if (success) return <Alert type="success" message={success} />;
  if (warning) return <Alert type="warning" message={warning} />;
  if (info) return <Alert type="info" message={info} />;
  return null;
}
