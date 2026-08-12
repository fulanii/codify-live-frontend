import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../services/api';

export function LoginForm(): JSX.Element {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Could not reach the server. Is the API running?'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-ink-secondary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-500"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-ink-secondary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-500"
          placeholder="••••••••"
        />
      </div>

      {error !== null && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoggingIn}
        className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-surface-base transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoggingIn ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
