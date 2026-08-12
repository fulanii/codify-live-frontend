import { Link, Navigate } from 'react-router-dom';

import { GoogleButton } from '../components/GoogleButton';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';

export function AuthPage(): JSX.Element {
  const { user, isBootstrapping, isLoggingIn } = useAuth();

  if (user !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
          CodifyLive
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-muted">Sign in to continue to CodifyLive.</p>

          <div className="mt-8">
            <GoogleButton
              onClick={authService.startGoogleLogin}
              disabled={isBootstrapping || isLoggingIn}
            />
          </div>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-surface-border" />
            <span className="text-xs uppercase tracking-wider text-ink-muted">or</span>
            <span className="h-px flex-1 bg-surface-border" />
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs leading-relaxed text-ink-muted">
            Password sign-in is available for accounts that have set one. New accounts are created
            through Google.
          </p>
        </div>
      </main>
    </div>
  );
}
