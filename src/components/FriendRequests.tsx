import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../hooks/useAuth';
import { friendshipService } from '../services/api';
import type { FriendRequest, FriendRequestStatus } from '../types/friendship.types';
import { Icon } from './Icon';

const STATUS_CLASSES: Record<FriendRequestStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-300',
  accepted: 'bg-brand-500/10 text-brand-300',
  declined: 'bg-red-500/10 text-red-300',
  cancelled: 'bg-surface-overlay text-ink-muted',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface RequestListProps {
  title: string;
  emptyLabel: string;
  requests: FriendRequest[];
  usernameOf: (request: FriendRequest) => string;
}

function RequestList({ title, emptyLabel, requests, usernameOf }: RequestListProps): JSX.Element {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-secondary">
        {title}
        <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs font-medium text-ink-muted">
          {requests.length}
        </span>
      </h3>

      {requests.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
          {requests.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold uppercase text-ink-secondary">
                {usernameOf(item).slice(0, 2)}
              </span>

              <span className="min-w-0 flex-1 truncate text-sm text-ink-primary">
                {usernameOf(item)}
              </span>

              <span className="shrink-0 text-xs text-ink-muted">{formatDate(item.created_at)}</span>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_CLASSES[item.status]}`}
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FriendRequests(): JSX.Element {
  const { user } = useAuth();

  const { data, isPending, error } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => friendshipService.listRequests(),
  });

  if (isPending) {
    return <p className="text-sm text-ink-muted">Loading requests…</p>;
  }

  // Raw HTTP status text ("Not Found") reads like something the user did wrong.
  // A failure here is ours, so the copy stays the same whatever the status.
  if (error !== null) {
    return (
      <p
        role="alert"
        className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        <Icon name="alert" className="h-4 w-4 shrink-0 text-red-400" />
        Could not load friend requests. Try again in a moment.
      </p>
    );
  }

  const requests = data ?? [];
  const sent = requests.filter((item) => item.sender_id === user?.id);
  const received = requests.filter((item) => item.sender_id !== user?.id);

  return (
    <div className="flex flex-col gap-8">
      <RequestList
        title="Received"
        emptyLabel="Nobody has sent you a request yet."
        requests={received}
        usernameOf={(item) => item.sender_username}
      />

      <RequestList
        title="Sent"
        emptyLabel="You have not sent any requests."
        requests={sent}
        usernameOf={(item) => item.receiver_username}
      />
    </div>
  );
}
