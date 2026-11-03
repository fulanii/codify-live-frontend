import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../hooks/useAuth';
import { ApiError, friendshipService } from '../services/api';
import type { FriendRequest, UpdatedFriendRequest } from '../types/friendship.types';
import { Icon } from './Icon';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const ACTION_CLASS =
  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const OUTLINE_CLASS = `${ACTION_CLASS} border border-surface-border text-ink-secondary hover:border-brand-500 hover:text-brand-400 disabled:hover:border-surface-border disabled:hover:text-ink-secondary`;

type Direction = 'sent' | 'received';

type RequestAction = 'accept' | 'decline' | 'cancel';

// Who may make each transition is the server's call: accept and decline belong
// to the receiver, cancel to the sender. Showing the wrong button would just
// earn a 404.
const ACTIONS: Record<RequestAction, (requestId: string) => Promise<UpdatedFriendRequest>> = {
  accept: friendshipService.acceptRequest,
  decline: friendshipService.declineRequest,
  cancel: friendshipService.cancelRequest,
};

const PENDING_LABELS: Record<RequestAction, string> = {
  accept: 'Accepting…',
  decline: 'Declining…',
  cancel: 'Cancelling…',
};

interface RequestRowProps {
  request: FriendRequest;
  direction: Direction;
  username: string;
}

// One mutation per row, not per button: only one transition can be in flight
// for a given request, and `variables` says which one it is.
function RequestRow({ request, direction, username }: RequestRowProps): JSX.Element {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (action: RequestAction) => ACTIONS[action](request.id),
    onSuccess: async () => {
      // Accepting creates a friendship row, so both lists are stale.
      await queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const runningAction = mutation.isPending ? mutation.variables : null;

  function labelFor(action: RequestAction, idle: string): string {
    return runningAction === action ? PENDING_LABELS[action] : idle;
  }

  const errorMessage =
    mutation.error === null
      ? null
      : mutation.error instanceof ApiError
        ? mutation.error.message
        : 'Could not reach the server.';

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold uppercase text-ink-secondary">
        {username.slice(0, 2)}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm text-ink-primary">{username}</span>

      <span className="shrink-0 text-xs text-ink-muted">{formatDate(request.created_at)}</span>

      {direction === 'sent' ? (
        <button
          type="button"
          onClick={() => mutation.mutate('cancel')}
          disabled={mutation.isPending}
          className={OUTLINE_CLASS}
        >
          {labelFor('cancel', 'Cancel')}
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => mutation.mutate('accept')}
            disabled={mutation.isPending}
            className={`${ACTION_CLASS} bg-brand-500 text-surface-base hover:bg-brand-400`}
          >
            {labelFor('accept', 'Accept')}
          </button>

          <button
            type="button"
            onClick={() => mutation.mutate('decline')}
            disabled={mutation.isPending}
            className={OUTLINE_CLASS}
          >
            {labelFor('decline', 'Decline')}
          </button>
        </>
      )}

      {errorMessage !== null && (
        <p
          role="alert"
          className="flex w-full items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-300"
        >
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0 text-red-400" />
          {errorMessage}
        </p>
      )}
    </li>
  );
}

interface RequestListProps {
  title: string;
  emptyLabel: string;
  requests: FriendRequest[];
  direction: Direction;
  usernameOf: (request: FriendRequest) => string;
}

function RequestList({
  title,
  emptyLabel,
  requests,
  direction,
  usernameOf,
}: RequestListProps): JSX.Element {
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
            <RequestRow
              key={item.id}
              request={item}
              direction={direction}
              username={usernameOf(item)}
            />
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

  // Only pending requests are actionable. The endpoint returns every row it
  // has, including ones already accepted, declined or cancelled, and those
  // belong in a history view rather than in a list of things to answer.
  const pending = (data ?? [])
    .filter((item) => item.status === 'pending')
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  const sent = pending.filter((item) => item.sender_id === user?.id);
  const received = pending.filter((item) => item.sender_id !== user?.id);

  return (
    <div className="flex flex-col gap-8">
      <RequestList
        title="Received"
        emptyLabel="Nobody has sent you a request yet."
        requests={received}
        direction="received"
        usernameOf={(item) => item.sender_username}
      />

      <RequestList
        title="Sent"
        emptyLabel="You have not sent any requests."
        requests={sent}
        direction="sent"
        usernameOf={(item) => item.receiver_username}
      />
    </div>
  );
}
