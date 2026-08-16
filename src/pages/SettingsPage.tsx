import { useAuth } from '../hooks/useAuth';

const AUTH_PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Login',
  google_password: 'Google & Password Login',
};

export function SettingsPage(): JSX.Element {
  const { user } = useAuth();

  const signInMethod =
    user === null ? '—' : (AUTH_PROVIDER_LABELS[user.auth_provider] ?? user.auth_provider);

  const accountRows = [
    { label: 'Name', value: user?.name ?? '—' },
    { label: 'Email', value: user?.email ?? '—' },
    { label: 'Sign-in method', value: signInMethod },
    { label: 'Email verified', value: user?.is_verified === true ? 'Yes' : 'No' },
    { label: 'Account status', value: user?.is_active === true ? 'Active' : 'Inactive' },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">Account</h2>

        <dl className="mt-4 divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
          {accountRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <dt className="text-sm text-ink-muted">{row.label}</dt>
              <dd className="truncate text-sm text-ink-primary">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">Password</h2>

        <div className="mt-4 rounded-xl border border-dashed border-surface-border bg-surface-raised px-5 py-6">
          <p className="text-sm font-medium text-ink-primary">Not built yet</p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            Setting a password will let you sign in without Google, so the account is not tied to a
            single identity provider.
          </p>
        </div>
      </section>
    </div>
  );
}
