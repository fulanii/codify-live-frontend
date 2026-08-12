import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../services/api';
import { Icon } from './Icon';

export function LoginForm(): JSX.Element {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
          className="rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-base text-ink-primary placeholder:text-ink-muted focus:border-brand-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-ink-secondary">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface-base py-3 pl-4 pr-12 text-base text-ink-primary placeholder:text-ink-muted focus:border-brand-500 sm:text-sm"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((previous) => !previous)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            aria-controls="password"
            className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-ink-muted hover:text-ink-primary"
          >
            <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} />
          </button>
        </div>
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
