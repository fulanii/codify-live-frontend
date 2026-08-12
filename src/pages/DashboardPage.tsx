import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export function DashboardPage(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold tracking-tight">CodifyLive</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
        >
          Sign out
        </button>
      </header>

      <main className="mt-12">
        <h1 className="text-2xl font-semibold tracking-tight">Signed in as {user?.name}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Chat, calls, and the collaborative editor land here as they are built.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-surface-border bg-surface-border sm:grid-cols-2">
          {[
            { label: 'Email', value: user?.email ?? '—' },
            { label: 'Provider', value: user?.auth_provider ?? '—' },
            { label: 'Verified', value: user?.is_verified === true ? 'Yes' : 'No' },
            { label: 'Active', value: user?.is_active === true ? 'Yes' : 'No' },
          ].map((row) => (
            <div key={row.label} className="bg-surface-raised px-5 py-4">
              <dt className="text-xs uppercase tracking-wider text-ink-muted">{row.label}</dt>
              <dd className="mt-1 text-sm text-ink-primary">{row.value}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
