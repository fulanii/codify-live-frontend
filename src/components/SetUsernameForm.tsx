import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../hooks/useAuth';
import { ApiError, authService } from '../services/api';

const MIN_LENGTH = 3;
const MAX_LENGTH = 30;

// Mirrors SetUserUsername in the backend. The server still enforces all of it —
// this only saves a round trip.
function validate(username: string): string | null {
  if (username.length < MIN_LENGTH || username.length > MAX_LENGTH) {
    return `Username must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`;
  }

  if (!/^[A-Za-z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens.';
  }

  if (!/^[A-Za-z0-9]/.test(username)) {
    return 'Username must start with a letter or a number.';
  }

  return null;
}

export function SetUsernameForm(): JSX.Element {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (value: string) => authService.setUsername({ username: value }),
    onSuccess: (updated) => updateUser(updated),
  });

  const trimmed = username.trim();
  const isUnchanged = trimmed === (user?.username ?? '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const invalid = validate(trimmed);
    setError(invalid);

    if (invalid !== null) {
      return;
    }

    try {
      await mutation.mutateAsync(trimmed);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Could not reach the server. Please try again.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-ink-secondary">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          spellCheck={false}
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-base text-ink-primary placeholder:text-ink-muted focus:border-brand-500 sm:text-sm"
          placeholder="vaporNimbus14"
        />
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        {MIN_LENGTH}–{MAX_LENGTH} characters. Letters, numbers, underscores and hyphens, starting
        with a letter or number. This is how other people find you.
      </p>

      {error !== null && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {mutation.isSuccess && error === null && (
        <p role="status" className="rounded-lg bg-brand-500/10 px-4 py-3 text-sm text-brand-300">
          Username saved.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || isUnchanged}
        className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-surface-base transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Save username'}
      </button>
    </form>
  );
}
