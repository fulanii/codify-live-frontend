import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { Icon } from './Icon';
import { Sidebar } from './Sidebar';

const STORAGE_KEY = 'sidebar-collapsed';

export function DashboardLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Navigating from the drawer should close it, otherwise it stays over the
  // page the user just asked for.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // The drawer overlays the page, so the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapsed={() => setIsCollapsed((previous) => !previous)}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
        userName={user?.name ?? ''}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-surface-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileOpen}
            className="rounded-lg p-2 text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary"
          >
            <Icon name="menu" />
          </button>
          <span className="font-mono text-sm font-semibold tracking-tight">CodifyLive</span>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
