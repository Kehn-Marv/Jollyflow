import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, LogOut, Plus, Settings, Store } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { DemoTag } from '../ui/DemoTag';
import { useAuth } from '../../contexts/AuthContext';
import { useDb } from '../../contexts/DataContext';
import { isPast } from '../../utils/dates';
import { btn, cx } from '../../utils/styles';

const NAV = [
{ to: '/app', label: 'Dashboard', icon: Home, end: true },
{ to: '/app/events', label: 'Events', icon: CalendarDays, end: true },
{ to: '/app/vendors', label: 'Vendors', icon: Store, end: false },
{ to: '/app/settings', label: 'Settings', icon: Settings, end: true }];


export function AppSidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { user, signOut } = useAuth();
  const db = useDb();
  const navigate = useNavigate();
  const upcoming = db.events.
  filter((e) => e.managed && (e.status === 'published' || e.status === 'draft') && !isPast(e.endsAt)).
  sort((a, b) => a.startsAt.localeCompare(b.startsAt)).
  slice(0, 6);

  const linkClass = ({ isActive }: {isActive: boolean;}) =>
  cx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-lime text-ink' : 'text-paper/75 hover:bg-white/[0.07] hover:text-paper');

  return (
    <div className="on-dark flex h-full flex-col bg-ink text-paper">
      <div className="flex h-16 items-center px-5">
        <NavLink to="/" onClick={onNavigate} aria-label="JolliFlow home"><Logo tone="light" /></NavLink>
      </div>
      <div className="px-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            navigate('/app/events/new');
          }}
          className={cx(btn.base, btn.lime, btn.md, 'w-full')}>
          
          <Plus className="h-4 w-4" aria-hidden="true" /> Create event
        </button>
      </div>
      <nav className="mt-5 px-3" aria-label="Workspace">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) =>
          <li key={to}>
              <NavLink to={to} end={end} onClick={onNavigate} className={linkClass}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-3">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-paper/40">Upcoming</p>
        <ul className="mt-2 space-y-0.5">
          {upcoming.map((e) =>
          <li key={e.id}>
              <NavLink to={`/app/events/${e.id}`} onClick={onNavigate} className={({ isActive }) => cx('flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition', isActive ? 'bg-white/10 text-paper' : 'text-paper/65 hover:bg-white/[0.06] hover:text-paper')}>
                <img src={e.coverUrl} alt="" className="h-6 w-6 shrink-0 rounded-md object-cover" />
                <span className="truncate">{e.title}</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral font-display text-sm font-bold text-ink">
            {user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            {user?.isDemo ? <DemoTag tone="dark">Demo account</DemoTag> : <p className="truncate text-xs text-paper/50">{user?.email}</p>}
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={async () => {
              onNavigate?.();
              await signOut();
              navigate('/');
            }}
            className="grid h-9 w-9 place-items-center rounded-lg text-paper/60 hover:bg-white/10 hover:text-paper">
            
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>);

}