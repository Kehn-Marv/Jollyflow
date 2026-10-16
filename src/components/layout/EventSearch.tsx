import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { fmtShortDate } from '../../utils/dates';
import { SmartImage } from '../ui/SmartImage';
import { cx, inputClass } from '../../utils/styles';

/** Live event search: suggestions as you type, Enter shows all matches on the Events page. */
export function EventSearch() {
  const db = useDb();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const onEventsPage = pathname === '/app/events';
  const [query, setQuery] = useState(onEventsPage ? params.get('q') ?? '' : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (onEventsPage) setQuery(params.get('q') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEventsPage, params.get('q')]);

  useEffect(() => {
    const close = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return db.events.
    filter((e) => e.managed).
    filter((e) => `${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(needle)).
    sort((a, b) => a.startsAt.localeCompare(b.startsAt)).
    slice(0, 6);
  }, [db.events, query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pick = open && results[active];
    setOpen(false);
    if (pick && !onEventsPage) return navigate(`/app/events/${pick.id}`);
    navigate(`/app/events${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return (
    <form ref={wrap} role="search" onSubmit={submit} className="relative hidden max-w-md flex-1 sm:block">
      <label htmlFor="app-search" className="sr-only">Search events</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
      <input
        id="app-search"
        value={query}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && query.trim().length > 0}
        aria-controls="app-search-results"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          if (onEventsPage) navigate(`/app/events${e.target.value.trim() ? `?q=${encodeURIComponent(e.target.value)}` : ''}`, { replace: true });
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {e.preventDefault();setActive((a) => Math.min(a + 1, results.length - 1));}
          if (e.key === 'ArrowUp') {e.preventDefault();setActive((a) => Math.max(a - 1, 0));}
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Search events by name or city"
        className={cx(inputClass, 'h-10 pl-9')} />
      
      {open && query.trim() && !onEventsPage &&
      <div id="app-search-results" role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,17,15,0.25)]">
          {results.length ?
        <>
              {results.map((e, i) =>
          <button
            key={e.id}
            type="button"
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => {setOpen(false);setQuery('');navigate(`/app/events/${e.id}`);}}
            className={cx('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left', i === active ? 'bg-paper' : '')}>
            
                  <SmartImage src={e.coverUrl} wrapperClassName="h-9 w-9 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{e.title}</span>
                    <span className="block truncate text-xs text-smoke">{fmtShortDate(e.startsAt)} · {e.city}</span>
                  </span>
                </button>
          )}
              <button type="submit" className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-line px-2.5 py-2 text-xs text-smoke hover:text-ink">
                See all results for “{query.trim()}” <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </> :

        <p className="px-3 py-4 text-center text-sm text-smoke">No events match “{query.trim()}”. Try “Kemi” or “Lagos”.</p>
        }
        </div>
      }
    </form>);

}