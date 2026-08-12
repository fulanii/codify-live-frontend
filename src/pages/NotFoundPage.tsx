import { Link } from 'react-router-dom';

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm text-brand-400">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <Link
        to="/"
        className="mt-2 rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400"
      >
        Back home
      </Link>
    </div>
  );
}
