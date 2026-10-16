import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, Clock, Download, MapPin, Share2 } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { publicEventUrl } from '../../utils/events';
import { fmtDate, fmtTime } from '../../utils/dates';
import { copyText } from '../../utils/clipboard';
import { downloadEventReport } from '../../utils/eventReport';
import { StatusPill, type PillTone } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { CountdownPill } from './CountdownPill';
import { EditEventDialog } from './EditEventDialog';
import { btn, cx } from '../../utils/styles';

const STATUS: Record<EventRecord['status'], {label: string;tone: PillTone;}> = {
  draft: { label: 'Draft', tone: 'lime' },
  published: { label: 'Published', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  archived: { label: 'Archived', tone: 'neutral' }
};

function dateRange(startIso: string, endIso: string) {
  const sameDay = new Date(startIso).toDateString() === new Date(endIso).toDateString();
  return sameDay ? fmtDate(startIso) : `${fmtDate(startIso)} – ${fmtDate(endIso)}`;
}

export function EventHeader({ event }: {event: EventRecord;}) {
  const db = useDb();
  const [editOpen, setEditOpen] = useState(false);
  const s = STATUS[event.status];
  const hasLocation = Boolean(event.venue?.trim());

  async function share() {
    if (event.status !== 'published') {
      toast('Publish this event to share it', { description: 'Drafts don’t have a public page yet. Publish from the Settings tab.' });
      return;
    }
    const url = publicEventUrl(event);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {

        /* dismissed — fall through to copy */}
    }
    (await copyText(url)) ? toast.success('Event link copied') : toast.error('Couldn’t copy the link.');
  }

  function report() {
    downloadEventReport(db, event);
    toast.success('Event report downloaded');
  }

  return (
    <header className="space-y-6">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <Link to="/app" className="inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 text-sm font-medium text-smoke transition hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <CountdownPill startsAt={event.startsAt} endsAt={event.endsAt} />
          <button type="button" onClick={share} aria-label="Share event" className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-ink/30">
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Event info */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{event.title}</h1>
            {event.status !== 'published' && <StatusPill tone={s.tone}>{s.label}</StatusPill>}
          </div>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-smoke">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" />{dateRange(event.startsAt, event.endsAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{fmtTime(event.startsAt)} – {fmtTime(event.endsAt)}</span>
            {hasLocation ?
            <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 text-left transition hover:text-ink" aria-label={`Location: ${event.venue}, ${event.city}. Edit location`}>
                <MapPin className="h-4 w-4" aria-hidden="true" />{event.venue}{event.city ? `, ${event.city}` : ''}
              </button> :

            <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Set Event Location
              </button>
            }
          </p>
        </div>
        <Button type="button" onClick={report} className={cx(btn.base, btn.outline, btn.sm, 'self-start sm:self-auto')}>
          <Download className="h-4 w-4" aria-hidden="true" /> Download Event Report
        </Button>
      </div>

      {event.status === 'draft' && <p className="rounded-2xl bg-lime/40 px-4 py-2.5 text-sm text-ink">This event is a draft. Its public page and RSVP link aren’t live yet — publish it from <Link to={`/app/events/${event.id}/settings`} className="font-semibold underline">Settings</Link>.</p>}
      {event.status === 'cancelled' && <p className="rounded-2xl bg-[#FADBD4] px-4 py-2.5 text-sm text-danger">This event is cancelled. Guests see a cancellation notice on the public page.</p>}

      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
    </header>);

}