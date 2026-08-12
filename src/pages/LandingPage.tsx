import { Link } from 'react-router-dom';

import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

interface Feature {
  title: string;
  description: string;
  status: 'live' | 'building' | 'planned';
}

const FEATURES: Feature[] = [
  {
    title: 'Real-time chat',
    description:
      'Direct messages over a single multiplexed WebSocket, with presence and typing indicators. Messages persist before they broadcast, so nothing is delivered that was never saved.',
    status: 'building',
  },
  {
    title: 'Audio & video calls',
    description:
      'Peer-to-peer WebRTC. The backend is a signaling relay only — offer, answer, and ICE candidates pass through as opaque payloads, and media never touches the server.',
    status: 'planned',
  },
  {
    title: 'Collaborative editing',
    description:
      'Write code together in the browser. CRDT-backed so concurrent edits converge by construction, with document state snapshotted server-side.',
    status: 'planned',
  },
  {
    title: 'Sandboxed execution',
    description:
      'Run what you write. Untrusted code executes in an isolated runner with hard timeouts, output caps, and per-user rate limits — never inside the API process.',
    status: 'planned',
  },
];

const STACK: string[] = [
  'FastAPI',
  'PostgreSQL',
  'SQLAlchemy 2.0 (async)',
  'Alembic',
  'Redis',
  'WebSockets',
  'WebRTC',
  'React',
  'TypeScript',
  'AWS',
];

const STATUS_STYLES: Record<Feature['status'], string> = {
  live: 'bg-brand-500/15 text-brand-400',
  building: 'bg-accent-500/15 text-accent-400',
  planned: 'bg-surface-border text-ink-muted',
};

const STATUS_LABELS: Record<Feature['status'], string> = {
  live: 'Live',
  building: 'In progress',
  planned: 'Planned',
};

export function LandingPage(): JSX.Element {
  const { user } = useAuth();
  const isSignedIn = user !== null;

  const ctaTo = isSignedIn ? '/dashboard' : '/auth';
  const ctaLabel = isSignedIn ? 'Go to dashboard' : 'Sign in';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-mono text-sm font-semibold tracking-tight">CodifyLive</span>
        <Link
          to={ctaTo}
          className="rounded-lg border border-surface-border px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400"
        >
          {ctaLabel}
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-surface-border px-3 py-1 text-xs text-ink-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Under active development
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Chat, call, and code
              <span className="block text-brand-400">together in the browser.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary">
              CodifyLive is a real-time collaboration platform — a place to talk to someone and work
              in the same file at the same time, with no install and no setup.
            </p>

            <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
              It is also a deliberate engineering exercise: a production-shaped backend built from
              scratch to explore session security, real-time fan-out across instances, and running
              untrusted code safely.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={ctaTo}
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-base transition-colors hover:bg-brand-400"
              >
                {isSignedIn ? 'Go to dashboard' : 'Get started'}
              </Link>
              <a
                href="https://github.com/fulanii/codify-live-backend"
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-lg border border-surface-border px-6 py-3 text-sm font-medium text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
              >
                Read the source
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-surface-border bg-surface-raised/40">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight">What it does</h2>
            <p className="mt-2 text-ink-muted">
              Shipped incrementally. Nothing below is claimed before it works.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-xl border border-surface-border bg-surface-raised p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium text-ink-primary">{feature.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[feature.status]}`}
                    >
                      {STATUS_LABELS[feature.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Built with</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 font-mono text-xs text-ink-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
