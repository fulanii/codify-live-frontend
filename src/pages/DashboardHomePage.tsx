import { Link } from 'react-router-dom';

import { Icon, type IconName } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

const API_DOCS_URL = 'https://fulanii.github.io/codify-live-backend/';
const BACKEND_REPO_URL = 'https://github.com/fulanii/codify-live-backend';

const STACK = ['FastAPI', 'Postgres', 'SQLAlchemy', 'Alembic', 'JWT', 'Argon2'];

interface Area {
  label: string;
  to: string;
  icon: IconName;
  note: string;
  ready: boolean;
}

const AREAS: Area[] = [
  {
    label: 'Friends',
    to: '/dashboard/friends',
    icon: 'friends',
    note: 'Search for people and send friend requests.',
    ready: true,
  },
  {
    label: 'Settings',
    to: '/dashboard/settings',
    icon: 'settings',
    note: 'Pick a username and set a password.',
    ready: true,
  },
  {
    label: 'Chat',
    to: '/dashboard/chat',
    icon: 'chat',
    note: 'Message your friends in real time.',
    ready: false,
  },
  {
    label: 'Calls',
    to: '/dashboard/calls',
    icon: 'call',
    note: 'Audio and video calls in the browser.',
    ready: false,
  },
  {
    label: 'Editor',
    to: '/dashboard/editor',
    icon: 'code',
    note: 'Write and run code together.',
    ready: false,
  },
];

export function DashboardHomePage(): JSX.Element {
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-3xl">
      <section className="animate-fade-up overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-surface-raised via-surface-raised to-brand-500/10 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-400">CodifyLive</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hey {firstName}</h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          This is a backend project. The API does the real work; this UI is here so you can use it.
          Auth and friendships are done, messaging and calls are next.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-surface-base transition-colors hover:bg-brand-400"
          >
            Read the API docs
          </a>
          <a
            href={BACKEND_REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            Source on GitHub
          </a>
        </div>

        <ul className="mt-7 flex flex-wrap gap-2 border-t border-surface-border pt-5">
          {STACK.map((item) => (
            <li
              key={item}
              className="rounded-md bg-surface-overlay px-2.5 py-1 font-mono text-xs text-ink-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {AREAS.map((area) => (
          <Link
            key={area.to}
            to={area.to}
            className={`group flex items-start gap-3 rounded-xl border bg-surface-raised p-4 transition-all hover:-translate-y-0.5 ${
              area.ready
                ? 'border-surface-border hover:border-brand-500/60'
                : 'border-dashed border-surface-border hover:border-ink-muted'
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                area.ready
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'bg-surface-overlay text-ink-muted group-hover:text-ink-secondary'
              }`}
            >
              <Icon name={area.icon} />
            </span>

            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium text-ink-primary">
                {area.label}
                {!area.ready && (
                  <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider text-ink-muted">
                    Soon
                  </span>
                )}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{area.note}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
