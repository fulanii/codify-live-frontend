import { NavLink } from 'react-router-dom';

import { Icon, type IconName } from './Icon';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: 'home', end: true },
  { to: '/dashboard/chat', label: 'Chat', icon: 'chat' },
  { to: '/dashboard/calls', label: 'Calls', icon: 'call' },
  { to: '/dashboard/editor', label: 'Editor', icon: 'code' },
  { to: '/dashboard/settings', label: 'Settings', icon: 'settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
  userName: string;
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapsed,
  onCloseMobile,
  onLogout,
  userName,
}: SidebarProps): JSX.Element {
  // Collapsing only applies from lg up. Below that the sidebar is a drawer that
  // is either off-screen or fully open, so every collapse style is lg-prefixed.
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-surface-border bg-surface-raised transition-transform lg:static lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
    >
      <div className="flex h-16 items-center justify-between border-b border-surface-border px-4">
        <span
          className={`font-mono text-sm font-semibold tracking-tight ${
            isCollapsed ? 'lg:hidden' : ''
          }`}
        >
          CodifyLive
        </span>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close menu"
          className="rounded-lg p-2 text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary lg:hidden"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
          className="hidden rounded-lg p-2 text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary lg:block"
        >
          <Icon name="chevron" className={`h-4 w-4 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-surface-overlay text-brand-400'
                      : 'text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary'
                  } ${isCollapsed ? 'lg:justify-center' : ''}`
                }
              >
                <Icon name={item.icon} />
                <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-surface-border p-3">
        <p
          className={`truncate px-3 pb-2 text-xs text-ink-muted ${isCollapsed ? 'lg:hidden' : ''}`}
          title={userName}
        >
          {userName}
        </p>

        <button
          type="button"
          onClick={onLogout}
          title={isCollapsed ? 'Sign out' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary ${
            isCollapsed ? 'lg:justify-center' : ''
          }`}
        >
          <Icon name="logout" />
          <span className={isCollapsed ? 'lg:hidden' : ''}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
