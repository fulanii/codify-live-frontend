import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';

import { ApiError, authService } from '../services/api';
import { Icon } from './Icon';

const MIN_LENGTH = 8;
const MAX_LENGTH = 32;

// Mirrors SetUserPassword in the backend. The server still enforces all of it —
// this only saves a round trip and points at the offending field sooner.
function validate(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    return `Password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`;
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }

  if (!/[@$!%*?&]/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&).';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}

export function SetPasswordForm(): JSX.Element {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => authService.setPassword({ password, confirm_password: confirmPassword }),
    onSuccess: () => {
      setPassword('');
      setConfirmPassword('');
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const invalid = validate(password, confirmPassword);
    setError(invalid);

    if (invalid !== null) {
      return;
    }

    try {
      await mutation.mutateAsync();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Could not reach the server. Please try again.'
      );
    }
  };

  const inputClass =
    'w-full rounded-lg border border-surface-border bg-surface-base py-3 pl-4 pr-12 text-base text-ink-primary placeholder:text-ink-muted focus:border-brand-500 sm:text-sm';

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="new-password" className="text-sm font-medium text-ink-secondary">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            name="new-password"
            type={isVisible ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setIsVisible((previous) => !previous)}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isVisible}
            aria-controls="new-password"
            className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-ink-muted hover:text-ink-primary"
          >
            <Icon name={isVisible ? 'eye-off' : 'eye'} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-ink-secondary">
          Confirm password
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type={isVisible ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        {MIN_LENGTH}–{MAX_LENGTH} characters, with an uppercase letter, a lowercase letter, a
        number, and one of @$!%*?&.
      </p>

      {error !== null && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {mutation.isSuccess && error === null && (
        <p role="status" className="rounded-lg bg-brand-500/10 px-4 py-3 text-sm text-brand-400">
          Password set. You can now sign in with your email and password.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-surface-base transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Set password'}
      </button>
    </form>
  );
}
