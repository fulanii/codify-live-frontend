import { useQuery } from '@tanstack/react-query';

import { friendshipService } from '../services/api';
import { Icon } from './Icon';

function formatSince(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FriendsList(): JSX.Element {
  const { data, isPending, error } = useQuery({
    queryKey: ['friends'],
    queryFn: () => friendshipService.listFriends(),
  });

  if (isPending) {
    return <p className="text-sm text-ink-muted">Loading friends…</p>;
  }

  // The copy stays the same whatever the status: a failure here is ours, and
  // "Not Found" reads like something the user did wrong.
  if (error !== null) {
    return (
      <p
        role="alert"
        className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        <Icon name="alert" className="h-4 w-4 shrink-0 text-red-400" />
        Could not load your friends. Try again in a moment.
      </p>
    );
  }

  const friends = data ?? [];

  if (friends.length === 0) {
    return <p className="text-sm text-ink-muted">No friends yet. Search for someone above.</p>;
  }

  return (
    <ul className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
      {friends.map((friend) => (
        <li key={friend.id} className="flex items-center gap-3 px-5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-semibold uppercase text-brand-300">
            {friend.friend_username.slice(0, 2)}
          </span>

          <span className="min-w-0 flex-1 truncate text-sm text-ink-primary">
            {friend.friend_username}
          </span>

          <span className="shrink-0 text-xs text-ink-muted">
            Since {formatSince(friend.friends_since)}
          </span>
        </li>
      ))}
    </ul>
  );
}
