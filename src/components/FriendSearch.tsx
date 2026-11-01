import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ApiError, friendshipService, usersService } from '../services/api';
import type { UserSearchResult } from '../types/friendship.types';
import { Icon } from './Icon';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface SearchResultRowProps {
  user: UserSearchResult;
}

// Each row owns its own mutation so sending one request leaves the other rows
// untouched, and a 409 only marks the row it belongs to.
function SearchResultRow({ user }: SearchResultRowProps): JSX.Element {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => friendshipService.sendRequest(user.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friend-requests'] }),
  });

  const label = mutation.isPending ? 'Sending…' : mutation.isSuccess ? 'Requested' : 'Add friend';

  const errorMessage =
    mutation.error === null
      ? null
      : mutation.error instanceof ApiError
        ? mutation.error.message
        : 'Could not reach the server.';

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold uppercase text-ink-secondary">
        {user.username.slice(0, 2)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-ink-primary">{user.username}</span>

      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || mutation.isSuccess}
        className="shrink-0 rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-500 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-surface-border disabled:hover:text-ink-secondary"
      >
        {label}
      </button>

      {errorMessage !== null && (
        <p
          role="alert"
          className="flex w-full items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-300"
        >
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0 text-red-400" />
          {errorMessage}
        </p>
      )}

      {mutation.isSuccess && (
        <p
          role="status"
          className="flex w-full items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-2 text-xs leading-relaxed text-brand-300"
        >
          <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-brand-400" />
          Friend request sent to {user.username}.
        </p>
      )}
    </li>
  );
}

export function FriendSearch(): JSX.Element {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term.trim(), DEBOUNCE_MS);

  // The endpoint rejects anything under 2 characters with a 422, so the query
  // stays disabled until the term is long enough to be valid.
  const isSearchable = debouncedTerm.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, error } = useQuery({
    queryKey: ['users', 'search', debouncedTerm],
    queryFn: () => usersService.search(debouncedTerm),
    enabled: isSearchable,
  });

  const results = data ?? [];
  const isTyping = term.trim() !== debouncedTerm;

  return (
    <div className="w-full max-w-lg">
      <label htmlFor="friend-search" className="text-sm font-medium text-ink-secondary">
        Find people
      </label>

      <div className="relative mt-2">
        <input
          id="friend-search"
          type="search"
          autoComplete="off"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by username"
          className="w-full rounded-lg border border-surface-border bg-surface-base py-3 pl-4 pr-10 text-base text-ink-primary placeholder:text-ink-muted focus:border-brand-500 sm:text-sm"
        />

        {(isFetching || isTyping) && isSearchable && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-ink-muted">
            …
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-ink-muted">
        Matches usernames starting with what you type. Minimum {MIN_QUERY_LENGTH} characters.
      </p>

      {error !== null && (
        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error instanceof ApiError ? error.message : 'Could not reach the server.'}
        </p>
      )}

      {isSearchable && !isFetching && error === null && results.length === 0 && (
        <p className="mt-4 text-sm text-ink-muted">No users found for “{debouncedTerm}”.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border bg-surface-raised">
          {results.map((user) => (
            <SearchResultRow key={user.id} user={user} />
          ))}
        </ul>
      )}

      {!isSearchable && term.trim().length > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
          <Icon name="search" className="h-4 w-4" />
          Keep typing…
        </p>
      )}
    </div>
  );
}
