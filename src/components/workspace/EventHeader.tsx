import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Lock, MapPin, Pencil, ScanLine, Settings2, Globe } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { EVENT_TYPE_LABELS, publicEventUrl } from '../../utils/events';
import { countdownLabel, fmtDate, fmtTime } from '../../utils/dates';
import { StatusPill, type PillTone } from '../ui/StatusPill';
import { CopyButton } from '../ui/CopyButton';
import { Button } from '../ui/Button';
import { EditEventDialog } from './EditEventDialog';
import { ManageEventDialog } from './ManageEventDialog';
import { btn, cx } from '../../utils/styles';

const STATUS: Record<EventRecord['status'], {label: string;tone: PillTone;}> = {
  draft: { label: 'Draft', tone: 'lime' },
  published: { label: 'Published', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  archived: { label: 'Archived', tone: 'neutral' }
};

export function EventHeader({ event }: {event: EventRecord;}) {
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const s = STATUS[event.status];

  return (
    <header className="overflow-hidden rounded-[1.6rem] border border-line bg-white">
      <div className="relative h-36 sm:h-48">
        <img src={event.coverUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/35" aria-hidden="true" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <StatusPill tone="dark">{EVENT_TYPE_LABELS[event.type]}</StatusPill>
          <StatusPill tone={s.tone}>{s.label}</StatusPill>
          <StatusPill tone="neutral" icon={event.visibility === 'public' ? Globe : Lock}>{event.visibility === 'public' ? 'Public' : 'Private'}</StatusPill>
          {event.isSample && <StatusPill tone="pink">Sample</StatusPill>}
        </div>
        <div className="absolute bottom-4 right-4 rounded-xl border-2 border-ink bg-lime px-3 py-1.5 font-display text-sm font-bold text-ink shadow-pop-sm">
          {countdownLabel(event.startsAt, event.endsAt)}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">{event.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-smoke">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" />{fmtDate(event.startsAt)} · {fmtTime(event.startsAt)}–{fmtTime(event.endsAt)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" />{event.venue}, {event.city}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'published' &&
          <>
              <Link to={`/events/${event.slug}`} target="_blank" rel="noreferrer" className={cx(btn.base, btn.outline, btn.sm)}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Public page
              </Link>
              <CopyButton value={publicEventUrl(event)} label="Share link" />
            </>
          }
          {event.features.tickets &&
          <Link to={`/check-in/${event.id}`} className={cx(btn.base, btn.outline, btn.sm)}>
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Check-in
            </Link>
          }
          <Button type="button" onClick={() => setEditOpen(true)} className={cx(btn.base, btn.ink, btn.sm)}>
            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit details
          </Button>
          <Button type="button" onClick={() => setManageOpen(true)} aria-label="Manage event status" className={cx(btn.base, btn.outline, btn.sm)}>
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Manage
          </Button>
        </div>
      </div>
      {event.status === 'draft' && <p className="border-t border-line bg-lime/40 px-6 py-2 text-sm text-ink">This event is a draft. Its public page and RSVP link are not live yet — publish it from Manage.</p>}
      {event.status === 'cancelled' && <p className="border-t border-line bg-[#FADBD4] px-6 py-2 text-sm text-danger">This event is cancelled. Guests see a cancellation notice on the public page.</p>}
      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
      <ManageEventDialog event={event} open={manageOpen} onOpenChange={setManageOpen} />
    </header>);

}