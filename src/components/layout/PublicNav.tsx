import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/Sheet';
import { useAuth } from '../../contexts/AuthContext';
import { btn, cx } from '../../utils/styles';

const LINKS = [
{ to: '/#product', label: 'Product' },
{ to: '/#how-it-works', label: 'How it works' },
{ to: '/features/planning', label: 'For planners' },
{ to: '/features/vendors', label: 'For vendors' },
{ to: '/#use-cases', label: 'Use cases' },
{ to: '/explore', label: 'Explore events' }];


export function PublicNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const primaryTo = user ? '/app/events/new' : '/signup';

  return (
    <header className="on-dark sticky top-0 z-40 w-full border-b border-white/10 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link to="/" aria-label="JolliFlow home" className="rounded-lg">
          <Logo tone="light" />
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) =>
          <li key={l.to}>
              <NavLink
              to={l.to}
              className={({ isActive }) =>
              cx('rounded-full px-3 py-2 text-sm font-medium text-paper/75 transition hover:bg-white/10 hover:text-paper', isActive && !l.to.includes('#') && 'text-lime')
              }>
              
                {l.label}
              </NavLink>
            </li>
          )}
        </ul>
        <div className="flex items-center gap-2">
          {user ?
          <Link to="/app" className={cx(btn.base, btn.onDark, btn.sm, 'hidden sm:inline-flex')}>
              Open workspace
            </Link> :

          <Link to="/signin" className={cx(btn.base, btn.onDark, btn.sm, 'hidden sm:inline-flex')}>
              Sign in
            </Link>
          }
          <Link to={primaryTo} className={cx(btn.base, btn.lime, btn.sm, 'hidden sm:inline-flex')}>
            Create an event
          </Link>
          <Button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className={cx(btn.base, btn.onDark, btn.icon, 'lg:hidden')}>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm border-l-2 border-ink bg-ink p-0 text-paper">
          <SheetHeader className="border-b border-white/10 p-5 text-left">
            <SheetTitle className="text-paper">
              <Logo tone="light" />
            </SheetTitle>
          </SheetHeader>
          <ul className="flex flex-col p-3">
            {LINKS.map((l) =>
            <li key={l.to}>
                <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(l.to);
                }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-display text-lg font-medium text-paper hover:bg-white/5">
                
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-paper/50" aria-hidden="true" />
                </button>
              </li>
            )}
          </ul>
          <div className="mt-auto flex flex-col gap-2 border-t border-white/10 p-5">
            <Button type="button" onClick={() => {setOpen(false);navigate(primaryTo);}} className={cx(btn.base, btn.lime, btn.lg)}>
              Create an event
            </Button>
            <Button type="button" onClick={() => {setOpen(false);navigate(user ? '/app' : '/signin');}} className={cx(btn.base, btn.onDark, btn.lg)}>
              {user ? 'Open workspace' : 'Sign in'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>);

}