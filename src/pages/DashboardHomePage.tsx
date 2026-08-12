import { Link } from 'react-router-dom';

import { Icon, type IconName } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

interface QuickLink {
  to: string;
  label: string;
  description: string;
  icon: IconName;
  ready: boolean;
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: '/dashboard/chat',
    label: 'Chat',
    description: 'Message a friend in real time',
    icon: 'chat',
    ready: false,
  },
  {
    to: '/dashboard/calls',
    label: 'Calls',
    description: 'Audio and video, peer to peer',
    icon: 'call',
    ready: false,
  },
  {
    to: '/dashboard/editor',
    label: 'Editor',
    description: 'Write and run code together',
    icon: 'code',
    ready: false,
  },
];

export function DashboardHomePage(): JSX.Element {
  const { user } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xl font-semibold text-brand-400">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 truncate text-sm text-ink-muted">{user?.email}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">Jump in</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border border-surface-border bg-surface-raised p-5 transition-colors hover:border-brand-500/50 hover:bg-surface-overlay"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-overlay text-ink-secondary transition-colors group-hover:text-brand-400">
                <Icon name={item.icon} />
              </span>

              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-primary">
                {item.label}
                {!item.ready && (
                  <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider text-ink-muted">
                    Soon
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
