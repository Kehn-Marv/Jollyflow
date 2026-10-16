import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, LifeBuoy, LogOut, Settings } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { cx } from '../../utils/styles';

const SUPPORT_EMAIL = 'support@jolliflow.ng';

export function AppSidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onEvents = pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/events') || pathname.startsWith('/app/vendors');

  const item = (active: boolean) =>
  cx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', active ? 'bg-lime text-ink' : 'text-paper/75 hover:bg-white/[0.07] hover:text-paper');
  const quiet = 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-paper/65 transition hover:bg-white/[0.07] hover:text-paper';

  return (
    <div className="on-dark flex h-full flex-col bg-ink text-paper">
      <div className="flex h-16 items-center px-5">
        <Link to="/" onClick={onNavigate} aria-label="JolliFlow home"><Logo tone="light" /></Link>
      </div>

      <nav className="mt-2 flex-1 px-3" aria-label="Workspace">
        <ul className="space-y-1">
          <li>
            <Link to="/app" onClick={onNavigate} aria-current={onEvents ? 'page' : undefined} className={item(onEvents)}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> My Events
            </Link>
          </li>
          <li>
            <NavLink to="/app/settings" onClick={onNavigate} className={({ isActive }) => item(isActive)}>
              <Settings className="h-4 w-4" aria-hidden="true" /> Account / Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral font-display text-sm font-bold text-ink">
            {user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{user?.name}</p>
        </div>
        <a href={`mailto:${SUPPORT_EMAIL}?subject=JolliFlow%20support`} onClick={onNavigate} className={quiet}>
          <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Support
        </a>
        <button
          type="button"
          onClick={async () => {
            onNavigate?.();
            await signOut();
            navigate('/');
          }}
          className={quiet}>
          
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log Out
        </button>
      </div>
    </div>);

}