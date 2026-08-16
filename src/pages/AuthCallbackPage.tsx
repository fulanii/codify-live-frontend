import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export function AuthCallbackPage(): JSX.Element {
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // Strict Mode runs effects twice in development. A second refresh would
  // present a token the backend has already rotated, which it treats as a
  // stolen cookie and answers by revoking every session for that user.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }

    hasRun.current = true;

    const finish = async (): Promise<void> => {
      const signedIn = await completeGoogleLogin();

      // replace, so Back does not return to a callback whose cookie is spent.
      navigate(signedIn ? '/dashboard' : '/auth', { replace: true });
    };

    void finish();
  }, [completeGoogleLogin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-ink-muted">Signing you in…</p>
    </div>
  );
}
