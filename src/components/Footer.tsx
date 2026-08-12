interface SocialLink {
  label: string;
  href: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/fulanii' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yassinecodes/' },
  { label: 'X', href: 'https://x.com/yassinecodes' },
  { label: 'Portfolio', href: 'https://yassinecodes.dev' },
];

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-surface-border bg-surface-base">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm text-ink-primary">CodifyLive</p>
          <p className="mt-1 text-sm text-ink-muted">
            Built by Yassine &middot; {new Date().getFullYear()}
          </p>
        </div>

        <nav aria-label="Social links">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-ink-secondary transition-colors hover:text-brand-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
