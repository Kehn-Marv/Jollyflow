import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, Pencil, Plus, Search, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, Guest, RsvpStatus } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { rsvpSummary } from '../../utils/rsvp';
import { publicEventUrl } from '../../utils/events';
import { copyText } from '../../utils/clipboard';
import { RsvpRing } from '../guests/RsvpRing';
import { GuestDialog } from './GuestDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CopyButton } from '../ui/CopyButton';
import { EmptyState } from '../ui/EmptyState';
import { StatusPill, type PillTone } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

const FILTERS: Array<{id: 'all' | RsvpStatus;label: string;}> = [
{ id: 'all', label: 'All' },
{ id: 'attending', label: 'Attending' },
{ id: 'pending', label: 'Pending' },
{ id: 'declined', label: 'Declined' }];


const INVITE: Record<Guest['invitation'], {label: string;tone: PillTone;}> = {
  not_sent: { label: 'Not invited', tone: 'neutral' },
  link_copied: { label: 'Link copied', tone: 'info' },
  simulated_sent: { label: 'Sent (simulated)', tone: 'pink' }
};

export function GuestsTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<'all' | RsvpStatus>(() => FILTERS.find((f) => f.id === params.get('filter'))?.id ?? 'all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{open: boolean;guest: Guest | null;}>({ open: params.get('new') === '1', guest: null });
  const [toDelete, setToDelete] = useState<Guest | null>(null);
  const { pending, run } = useAsyncAction();

  const guests = db.guests.filter((g) => g.eventId === event.id);
  const s = rsvpSummary(guests);
  const list = useMemo(
    () => guests.filter((g) => filter === 'all' || g.rsvp === filter).filter((g) => !q || `${g.name} ${g.contact} ${g.group}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)),
    [guests, filter, q]
  );

  useEffect(() => {
    if (params.get('new')) {
      const p = new URLSearchParams(params);
      p.delete('new');
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSel(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);else
      n.add(id);
      return n;
    });
  }

  async function copyInvite(g: Guest) {
    const ok = await copyText(publicEventUrl(event, g.id));
    if (!ok) return toast.error('Couldn’t copy the link.');
    toast.success(`Personal invite link for ${g.name} copied`);
    if (g.invitation === 'not_sent') await service.setInvitationStatus([g.id], 'link_copied');
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="flex flex-col items-center gap-5 rounded-[1.4rem] border border-line bg-white p-5 sm:flex-row">
          <RsvpRing summary={s} size={128} />
          <dl className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
            {[
            ['Invited', s.total],
            ['Attending', s.attending],
            ['Pending', s.pending],
            ['Declined', s.declined]].
            map(([l, v]) =>
            <div key={l as string} className="rounded-xl bg-paper p-3">
                <dt className="text-xs text-smoke">{l}</dt>
                <dd className="font-display text-2xl font-bold text-ink">{v}</dd>
              </div>
            )}
            <div className="col-span-2 text-xs text-smoke sm:col-span-4">
              Headcount incl. plus-ones: <strong className="text-ink">{s.headcount}</strong>{event.capacity ? ` of ${event.capacity} capacity` : ''} · {Math.round(s.responseRate)}% responded
            </div>
          </dl>
        </section>
        <section className="rounded-[1.4rem] border-2 border-ink bg-sky/50 p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Share the RSVP link</h3>
          {event.status !== 'published' ?
          <p className="mt-2 text-sm text-ink/80">Publish the event to activate its RSVP link.</p> :
          event.visibility === 'private' ?
          <p className="mt-2 text-sm text-ink/80">This event is private. Copy a <strong>personal invite link</strong> from each guest’s row — their response updates their own record.</p> :

          <p className="mt-2 text-sm text-ink/80">Anyone with this link can RSVP. Responses appear here instantly.</p>
          }
          {event.status === 'published' &&
          <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton value={publicEventUrl(event)} label={event.visibility === 'private' ? 'Copy general link' : 'Copy RSVP link'} variant="ink" />
              <CopyButton value={publicEventUrl(event)} label="Share" share={{ title: event.title }} />
            </div>
          }
          <p className="mt-3 text-xs text-ink/65">Messages are not sent by JolliFlow in this prototype — share links yourself via WhatsApp, SMS or email.</p>
        </section>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter guests">
          {FILTERS.map((f) =>
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cx('whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold', filter === f.id ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink')}>
              {f.label} <span className="opacity-60">{f.id === 'all' ? guests.length : guests.filter((g) => g.rsvp === f.id).length}</span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-64">
            <label htmlFor="guest-q" className="sr-only">Search guests</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
            <input id="guest-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests" className={cx(inputClass, 'h-10 pl-9')} />
          </div>
          <Button type="button" onClick={() => setDialog({ open: true, guest: null })} className={cx(btn.base, btn.ink, btn.md, 'h-10')}><Plus className="h-4 w-4" aria-hidden="true" /> Add guest</Button>
        </div>
      </div>

      {selected.size > 0 &&
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-ink bg-lime p-3 text-sm font-medium" role="region" aria-label="Bulk actions">
          <span>{selected.size} selected</span>
          <Button
          type="button"
          disabled={pending}
          onClick={async () => {
            const ok = await run(() => service.setInvitationStatus([...selected], 'simulated_sent').then(() => true), { success: 'Marked as sent (simulated — no messages delivered)' });
            if (ok) setSelected(new Set());
          }}
          className={cx(btn.base, btn.ink, btn.sm)}>
          
            <Send className="h-4 w-4" aria-hidden="true" /> Mark invites sent (simulated)
          </Button>
          <button type="button" onClick={() => setSelected(new Set())} className="underline">Clear</button>
        </div>
      }

      {list.length ?
      <ul className="overflow-hidden rounded-[1.4rem] border border-line bg-white">
          {list.map((g) =>
        <li key={g.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line p-3 last:border-0 sm:p-4 md:grid-cols-[auto_1.4fr_1fr_9rem_auto]">
              <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggleSel(g.id)} aria-label={`Select ${g.name}`} className="h-5 w-5 accent-ink" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{g.name}{g.plusOnes ? <span className="text-smoke"> +{g.plusOnes}</span> : null}</p>
                <p className="truncate text-xs text-smoke">{g.contact || 'No contact'} · {g.group}{g.source === 'public_rsvp' ? ' · via public RSVP' : ''}</p>
              </div>
              <div className="col-span-3 col-start-2 flex flex-wrap items-center gap-1.5 md:col-span-1 md:col-start-auto">
                <StatusPill tone={INVITE[g.invitation].tone}>{INVITE[g.invitation].label}</StatusPill>
              </div>
              <div className="col-span-3 col-start-2 md:col-span-1 md:col-start-auto">
                <label htmlFor={`rsvp-${g.id}`} className="sr-only">RSVP for {g.name}</label>
                <select
              id={`rsvp-${g.id}`}
              value={g.rsvp}
              onChange={(e) => run(() => service.updateGuest(g.id, { rsvp: e.target.value as RsvpStatus }), { success: `${g.name}: ${e.target.value}` })}
              className={cx('h-9 w-full rounded-lg border px-2 text-sm font-semibold', g.rsvp === 'attending' ? 'border-ok/30 bg-[#E1F1DE] text-ok' : g.rsvp === 'pending' ? 'border-coral/40 bg-[#FFE7DF] text-[#9C3418]' : 'border-line bg-sand text-ink')}>
              
                  <option value="pending">Pending</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div className="col-start-3 row-start-1 flex gap-0.5 md:col-start-auto md:row-start-auto">
                <button type="button" onClick={() => copyInvite(g)} aria-label={`Copy personal invite link for ${g.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Link2 className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={() => setDialog({ open: true, guest: g })} aria-label={`Edit ${g.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={() => setToDelete(g)} aria-label={`Remove ${g.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </li>
        )}
        </ul> :

      <EmptyState icon={Users} title={guests.length ? 'No guests match' : 'No guests yet'} message={guests.length ? 'Try a different filter or search.' : 'Add guests manually or share the RSVP link.'} action={<Button type="button" onClick={() => setDialog({ open: true, guest: null })} className={cx(btn.base, btn.ink, btn.md)}>Add guest</Button>} />
      }

      <GuestDialog event={event} guest={dialog.guest} open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove guest?"
        message={`${toDelete?.name} will be removed from the guest list.`}
        confirmLabel="Remove"
        pending={pending}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(() => service.deleteGuest(toDelete.id).then(() => true), { success: 'Guest removed' });
          if (ok) setToDelete(null);
        }} />
      
    </div>);

}