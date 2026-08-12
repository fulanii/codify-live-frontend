import { Icon, type IconName } from './Icon';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: IconName;
}

export function PagePlaceholder({ title, description, icon }: PagePlaceholderProps): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-surface-border bg-surface-raised px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-overlay text-ink-secondary">
          <Icon name={icon} className="h-6 w-6" />
        </span>

        <p className="mt-5 text-sm font-medium text-ink-primary">Not built yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
    </div>
  );
}
