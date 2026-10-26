import { Link } from 'react-router-dom';

import { Icon, type IconName } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

const API_DOCS_URL = 'https://fulanii.github.io/codify-live-backend/';
const BACKEND_REPO_URL = 'https://github.com/fulanii/codify-live-backend';

interface SessionFact {
  title: string;
  detail: string;
}

const SESSION_FACTS: SessionFact[] = [
  {
    title: 'Your access token is in memory, not a cookie',
    detail:
      'It is a JWT that expires in 15 minutes and is verified by signature alone, so authenticating a request costs no database lookup.',
  },
  {
    title: 'Your session lives in an httpOnly cookie',
    detail:
      'An opaque random string, stored server-side only as a SHA-256 hash, scoped to /auth. JavaScript cannot read it, and the database never holds anything usable.',
  },
  {
    title: 'Every refresh rotates that cookie',
    detail:
      'The old token is revoked and kept, not deleted. Presenting a revoked one means two parties hold it, so every session for that account is terminated.',
  },
];

interface AreaStatus {
  label: string;
  to: string;
  icon: IconName;
  note: string;
  ready: boolean;
}

const AREAS: AreaStatus[] = [
  {
    label: 'Friends',
    to: '/dashboard/friends',
    icon: 'friends',
    note: 'Username search is live, indexed prefix matching',
    ready: true,
  },
  {
    label: 'Settings',
    to: '/dashboard/settings',
    icon: 'settings',
    note: 'Add a password to a Google-only account',
    ready: true,
  },
  {
    label: 'Chat',
    to: '/dashboard/chat',
    icon: 'chat',
    note: 'Next: REST writes, WebSocket delivery',
    ready: false,
  },
  {
    label: 'Calls',
    to: '/dashboard/calls',
    icon: 'call',
    note: 'After chat: WebRTC signaling',
    ready: false,
  },
  {
    label: 'Editor',
    to: '/dashboard/editor',
    icon: 'code',
    note: 'Last: CRDT documents, sandboxed runs',
    ready: false,
  },
];

const BUILD_ORDER: string[] = [
  'Auth and sessions',
  'Friendships',
  'Chat over REST',
  'WebSocket delivery',
  'Redis fan-out across instances',
  'Calls, editor, execution',
];

const CURRENT_PHASE = 1;

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
            You are signed in, {user?.name}
          </h1>
          <p className="mt-1 truncate text-sm text-ink-muted">{user?.email}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          What just happened
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Signing in is the part of this project that is finished, and it is hand-written rather
          than handed to a library. Three things are now true of this browser tab:
        </p>

        <dl className="mt-5 divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
          {SESSION_FACTS.map((fact) => (
            <div key={fact.title} className="px-5 py-4">
              <dt className="text-sm font-medium text-ink-primary">{fact.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{fact.detail}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Worth trying: reload this page. The access token dies with the tab, so the app trades the
          cookie for a new one and restores your profile before the first paint. Open the network
          tab and you will see it happen once, not on every navigation.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          What works today
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {AREAS.map((area) => (
            <Link
              key={area.to}
              to={area.to}
              className="group flex items-start gap-3 rounded-xl border border-surface-border bg-surface-raised p-4 transition-colors hover:border-brand-500/50 hover:bg-surface-overlay"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-overlay text-ink-secondary transition-colors group-hover:text-brand-400">
                <Icon name={area.icon} />
              </span>

              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-ink-primary">
                  {area.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-normal uppercase tracking-wider ${
                      area.ready
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'bg-surface-border text-ink-muted'
                    }`}
                  >
                    {area.ready ? 'Live' : 'Empty'}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                  {area.note}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">Build order</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Each phase ships complete before the next one starts, so the app is always deployed and
          working rather than half-built in six places at once.
        </p>

        <ol className="mt-5 space-y-2">
          {BUILD_ORDER.map((phase, index) => (
            <li key={phase} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  index < CURRENT_PHASE
                    ? 'bg-brand-500/15 text-brand-400'
                    : index === CURRENT_PHASE
                      ? 'bg-accent-500/15 text-accent-400'
                      : 'bg-surface-raised text-ink-muted'
                }`}
              >
                {index + 1}
              </span>
              <span className={index <= CURRENT_PHASE ? 'text-ink-primary' : 'text-ink-muted'}>
                {phase}
              </span>
              {index === CURRENT_PHASE && (
                <span className="text-xs uppercase tracking-wider text-accent-400">
                  in progress
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 rounded-xl border border-surface-border bg-surface-raised p-5">
        <h2 className="text-sm font-medium text-ink-primary">Look at it yourself</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Every endpoint is documented from its own docstring, including the failure cases and why
          each status code is what it is.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            API reference
          </a>
          <a
            href={BACKEND_REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            Backend source
          </a>
        </div>
      </section>
    </div>
  );
}
