import React, { useMemo, useState } from 'react';
import { CalendarSearch, Search } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { NativeSelect } from '../../components/ui/FormField';
import { DemoTag } from '../../components/ui/DemoTag';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { isPast } from '../../utils/dates';
import type { EventType } from '../../types/domain';
import { cx, inputClass } from '../../utils/styles';

export function Explore() {
  const db = useDb();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [when, setWhen] = useState<'upcoming' | 'month' | 'past'>('upcoming');
  const publicEvents = db.events.filter((e) => e.visibility === 'public' && e.status === 'published');
  const cities = Array.from(new Set(publicEvents.map((e) => e.city)));
  const list = useMemo(() => {
    const now = Date.now();
    return publicEvents.
    filter((e) => when === 'past' ? isPast(e.endsAt) : !isPast(e.endsAt) && (when === 'upcoming' || new Date(e.startsAt).getTime() - now < 30 * 86_400_000)).
    filter((e) => !city || e.city === city).
    filter((e) => !type || e.type === type).
    filter((e) => !q || `${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(q.toLowerCase())).
    sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [publicEvents, q, city, type, when]);

  return (
    <div className="bg-paper">
      <section className="on-dark bg-ink text-paper">
        <div className="container py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Explore</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Find something to celebrate.</h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-paper/70">Public events across Nigeria. <DemoTag tone="dark">Sample events</DemoTag></p>
        </div>
      </section>
      <div className="container py-10">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <label htmlFor="ex-q" className="sr-only">Search events</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
            <input id="ex-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, venues, cities" className={cx(inputClass, 'pl-9')} />
          </div>
          <NativeSelect aria-label="City" value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</NativeSelect>
          <NativeSelect aria-label="Event type" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}</NativeSelect>
          <NativeSelect aria-label="Date" value={when} onChange={(e) => setWhen(e.target.value as typeof when)}><option value="upcoming">All upcoming</option><option value="month">Next 30 days</option><option value="past">Past events</option></NativeSelect>
        </div>
        {list.length ?
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((e) => <EventCard key={e.id} event={e} to={`/events/${e.slug}`} />)}</div> :

        <EmptyState className="mt-8" icon={CalendarSearch} title="No events found" message="Try another city, type or date range." />
        }
      </div>
    </div>);

}