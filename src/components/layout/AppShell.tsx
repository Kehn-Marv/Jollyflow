import React, { Suspense, useCallback, useState } from 'react';
import { useCloseOnNavigate } from '../../hooks/useCloseOnNavigate';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, FlaskConical, Menu, Search, X } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { EventSearch } from './EventSearch';
import { RouteFallback } from './RouteFallback';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/Sheet';
import { SidePanel } from '../ui/SidePanel';
import { BodyPortal } from '../ui/BodyPortal';
import { NotificationFilters, NotificationsList, useNotificationFilter } from '../insights/NotificationsPanel';
import { Logo } from '../brand/Logo';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { cx } from '../../utils/styles';

/** Event search only belongs where events are listed. */
const SEARCH_PATHS = ['/app'];

export function AppShell() {
  const db = useDb();
  const { pathname } = useLocation();
  const showSearch = SEARCH_PATHS.includes(pathname.replace(/\/$/, ''));
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [filter, setFilter] = useNotificationFilter();
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useCloseOnNavigate(searchOpen, closeSearch, 640);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeBell = useCallback(() => setBellOpen(false), []);
  useCloseOnNavigate(menuOpen, closeMenu);
  useCloseOnNavigate(bellOpen, closeBell, 100000);
  const insights = computeInsights(db);
  const urgent = insights.filter((i) => i.severity === 'critical').length;

  return (
    <div className="min-h-screen w-full bg-paper">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:font-semibold">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <AppSidebar />
      </aside>

      <div className="lg:pl-64">
        <div className="flex items-center justify-center gap-2 bg-lime px-4 py-1.5 text-center text-xs font-medium text-ink">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="sm:hidden">Demo mode — sample data only.</span>
          <span className="hidden sm:inline">Demo mode — sample data, simulated payments, nothing leaves this browser.</span>
          <Link to="/app/settings#data" className="hidden font-semibold underline sm:inline">Reset data</Link>
        </div>
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white lg:hidden">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link to="/app" className="lg:hidden" aria-label="Dashboard"><Logo compact /></Link>
            {showSearch && <EventSearch className="hidden sm:block" />}
            <div className="ml-auto flex items-center gap-2">
              {showSearch &&
              <button type="button" onClick={() => setSearchOpen((o) => !o)} aria-label={searchOpen ? 'Close search' : 'Search events'} aria-expanded={searchOpen} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white hover:border-ink sm:hidden">
                  {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                </button>
              }
              <button type="button" onClick={() => setBellOpen(true)} aria-label={`Notifications, ${insights.length} items need attention`} className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white hover:border-ink">
                <Bell className="h-5 w-5" aria-hidden="true" />
                {insights.length > 0 &&
                <span className={cx('absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-paper px-1 text-[10px] font-semibold tabular-nums', urgent ? 'bg-coral text-white' : 'bg-ink text-paper')}>
                    {insights.length > 9 ? '9+' : insights.length}
                  </span>
                }
              </button>
            </div>
          </div>
          {showSearch && searchOpen &&
          <div className="border-t border-line px-4 py-3 sm:hidden">
              <EventSearch autoFocus onDone={closeSearch} />
            </div>
          }
        </header>
        <main id="app-main" className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <BodyPortal>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="on-dark w-[86vw] max-w-xs border-0 !bg-ink p-0 !text-paper" showCloseButton={false}>
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>Workspace navigation</SheetDescription></SheetHeader>
          <AppSidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      </BodyPortal>

      <SidePanel
        open={bellOpen}
        onOpenChange={(o) => {
          setBellOpen(o);
          if (!o) setFilter('all');
        }}
        title="Notifications"
        description={insights.length ? `${insights.length} things across your events. Tap one to open it.` : 'Nothing needs you right now.'}
        toolbar={insights.length ? <NotificationFilters insights={insights} value={filter} onChange={setFilter} /> : undefined}>
        
        <NotificationsList insights={insights} filter={filter} onNavigate={() => setBellOpen(false)} />
      </SidePanel>
    </div>);

}