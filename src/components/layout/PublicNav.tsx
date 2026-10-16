import React, { useCallback, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/Sheet';
import { BodyPortal } from '../ui/BodyPortal';
import { useCloseOnNavigate } from '../../hooks/useCloseOnNavigate';
import { useAuth } from '../../contexts/AuthContext';
import { btn, cx } from '../../utils/styles';

const LINKS = [
{ to: '/#how-it-works', label: 'How it works' },
{ to: '/features/planning', label: 'For planners' },
{ to: '/features/vendors', label: 'For vendors' },
{ to: '/manifesto', label: 'Manifesto' },
{ to: '/explore', label: 'Explore events' }];


export function PublicNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const primaryTo = user ? '/app/events/new' : '/signup';
  const close = useCallback(() => setOpen(false), []);
  useCloseOnNavigate(open, close);

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

      {/* Portalled out of the blurred sticky header — otherwise the drawer is trapped inside its 64px box */}
      <BodyPortal>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
            side="right"
            showCloseButton={false}
            className="on-dark !inset-y-2 !right-2 !h-auto flex w-[calc(100vw-1rem)] max-w-sm flex-col gap-0 overflow-hidden rounded-[28px] border border-white/10 !bg-ink p-0 !text-paper">
            
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 px-5 py-4 text-left">
            <SheetTitle className="text-paper">
              <Logo tone="light" />
            </SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-paper transition hover:bg-white/20" aria-label="Close menu">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </SheetHeader>
          <ul className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
            {LINKS.map((l) =>
              <li key={l.to}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(l.to);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-lg font-medium !text-paper transition hover:bg-white/[0.07] active:bg-white/10">
                  
                  {l.label}
                  <ArrowRight className="h-4 w-4 text-paper/50" aria-hidden="true" />
                </button>
              </li>
              )}
          </ul>
          <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 p-5">
            <Button type="button" onClick={() => {setOpen(false);navigate(primaryTo);}} className={cx(btn.base, btn.lime, btn.lg)}>
              Create an event
            </Button>
            <Button type="button" onClick={() => {setOpen(false);navigate(user ? '/app' : '/signin');}} className={cx(btn.base, btn.onDark, btn.lg)}>
              {user ? 'Open workspace' : 'Sign in'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      </BodyPortal>
    </header>);

}