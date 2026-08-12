import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { user, isBootstrapping } = useAuth();

  // Without this gate a signed-in user would be bounced to /auth on every
  // reload, because restoring the session needs a round trip.
  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (user === null) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
