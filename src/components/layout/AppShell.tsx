import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Bell, FlaskConical, Menu, Search } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/Sheet';
import { InsightCard } from '../insights/InsightCard';
import { Logo } from '../brand/Logo';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { inputClass, cx } from '../../utils/styles';

export function AppShell() {
  const db = useDb();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState('');
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
          <span>Demo mode — sample data, simulated payments, nothing leaves this browser.</span>
          <Link to="/app/settings#data" className="hidden font-semibold underline sm:inline">Reset data</Link>
        </div>
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white lg:hidden">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link to="/app" className="lg:hidden" aria-label="Dashboard"><Logo compact /></Link>
            <form
              role="search"
              className="relative hidden max-w-md flex-1 sm:block"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/app/events?q=${encodeURIComponent(query.trim())}`);
              }}>
              
              <label htmlFor="app-search" className="sr-only">Search events</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
              <input id="app-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events by name or city" className={cx(inputClass, 'h-10 pl-9')} />
            </form>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setBellOpen(true)} aria-label={`Notifications, ${insights.length} items need attention`} className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white hover:border-ink">
                <Bell className="h-5 w-5" aria-hidden="true" />
                {insights.length > 0 &&
                <span className={cx('absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-paper px-1 text-[10px] font-bold', urgent ? 'bg-coral text-ink' : 'bg-ink text-paper')}>
                    {insights.length}
                  </span>
                }
              </button>
            </div>
          </div>
        </header>
        <main id="app-main" className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86vw] max-w-xs border-0 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>Workspace navigation</SheetDescription></SheetHeader>
          <AppSidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={bellOpen} onOpenChange={setBellOpen}>
        <SheetContent side="right" className="w-[92vw] max-w-md overflow-y-auto bg-white p-0">
          <SheetHeader className="border-b border-line p-5 text-left">
            <SheetTitle className="font-display text-xl">Needs attention</SheetTitle>
            <SheetDescription>Rule-based alerts across your events. Select one to open the record behind it.</SheetDescription>
          </SheetHeader>
          <ul className="space-y-1 p-3" onClick={() => setBellOpen(false)}>
            {insights.length ? insights.map((i) => <InsightCard key={i.id} insight={i} />) : <li className="p-6 text-center text-sm text-smoke">All clear. Nothing needs attention right now.</li>}
          </ul>
        </SheetContent>
      </Sheet>
    </div>);

}