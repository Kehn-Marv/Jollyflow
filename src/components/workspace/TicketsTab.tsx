import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, QrCode, ScanLine, Ticket as TicketIcon } from 'lucide-react';
import type { EventRecord, Ticket, TicketTier } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { eventTicketStats, tierStats } from '../../utils/tickets';
import { fmtDateTime, fmtShortDate } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { TierDialog } from './TierDialog';
import { TicketQr } from '../tickets/TicketQr';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusPill, type PillTone } from '../ui/StatusPill';
import { DemoTag } from '../ui/DemoTag';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

const TICKET: Record<Ticket['status'], {label: string;tone: PillTone;}> = {
  valid: { label: 'Valid', tone: 'success' },
  checked_in: { label: 'Checked in', tone: 'dark' },
  cancelled: { label: 'Cancelled', tone: 'danger' }
};

export function TicketsTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const tiers = db.ticketTiers.filter((t) => t.eventId === event.id);
  const orders = db.ticketOrders.filter((o) => o.eventId === event.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tickets = db.tickets.filter((t) => t.eventId === event.id);
  const stats = eventTicketStats(db, event.id);
  const [dialog, setDialog] = useState<{open: boolean;tier: TicketTier | null;}>({ open: false, tier: null });
  const [qr, setQr] = useState<Ticket | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">Tickets & access <DemoTag>Simulated sales</DemoTag></h2>
          <p className="text-sm text-smoke">{stats.sold} of {stats.capacity} sold · {stats.checkedIn} checked in · {formatNaira(stats.revenue)} simulated revenue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'published' && <Link to={`/events/${event.slug}`} target="_blank" rel="noreferrer" className={cx(btn.base, btn.outline, btn.md)}>Ticket page</Link>}
          <Link to={`/check-in/${event.id}`} className={cx(btn.base, btn.outline, btn.md)}><ScanLine className="h-4 w-4" aria-hidden="true" /> Open check-in</Link>
          <Button type="button" onClick={() => setDialog({ open: true, tier: null })} className={cx(btn.base, btn.ink, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> Tier</Button>
        </div>
      </div>

      {tiers.length ?
      <ul className="grid gap-3 md:grid-cols-3">
          {tiers.map((t) => {
          const s = tierStats(db, t.id);
          return (
            <li key={t.id} className="rounded-[1.4rem] border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-ink">{t.price ? formatNaira(t.price) : 'Free'}</p>
                  </div>
                  <button type="button" onClick={() => setDialog({ open: true, tier: t })} aria-label={`Edit ${t.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                </div>
                <p className="mt-1 text-xs text-smoke">{t.description}</p>
                <ProgressBar value={s.sold} max={t.quantity} label={`${t.name} sold`} tone={s.soldOut ? 'coral' : 'ink'} size="sm" className="mt-4" />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-smoke">{s.sold} sold · {s.remaining} left · {s.checkedIn} in</span>
                  {t.status !== 'on_sale' ? <StatusPill tone={t.status === 'cancelled' ? 'danger' : 'warning'}>{t.status === 'cancelled' ? 'Cancelled' : 'Paused'}</StatusPill> : s.soldOut ? <StatusPill tone="warning">Sold out</StatusPill> : <StatusPill tone="success">On sale</StatusPill>}
                </div>
              </li>);

        })}
        </ul> :

      <EmptyState icon={TicketIcon} title="No ticket tiers yet" message="Create a tier with a price and quantity to start selling (simulated)." action={<Button type="button" onClick={() => setDialog({ open: true, tier: null })} className={cx(btn.base, btn.ink, btn.md)}>Create tier</Button>} />
      }

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[1.4rem] border border-line bg-white">
          <h3 className="border-b border-line p-4 font-display text-lg font-semibold text-ink">Orders</h3>
          {orders.length ?
          <ul>
              {orders.map((o) =>
            <li key={o.id} className="flex flex-wrap items-center gap-3 border-b border-line p-4 text-sm last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{o.buyerName}</p>
                    <p className="truncate text-xs text-smoke">{o.quantity} × {tiers.find((t) => t.id === o.tierId)?.name} · {fmtShortDate(o.createdAt)} · <span className="font-mono">{o.reference}</span></p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatNaira(o.total)}</span>
                  <StatusPill tone={o.status === 'paid' ? 'success' : o.status === 'failed' ? 'danger' : 'warning'}>{o.status === 'paid' ? 'Paid (sim.)' : o.status === 'failed' ? 'Failed' : 'Processing'}</StatusPill>
                </li>
            )}
            </ul> :
          <p className="p-6 text-center text-sm text-smoke">No orders yet.</p>}
        </section>
        <section className="rounded-[1.4rem] border border-line bg-white">
          <div className="border-b border-line p-4">
            <h3 className="font-display text-lg font-semibold text-ink">Issued tickets</h3>
            <p className="text-xs text-smoke">Try these codes in check-in. Each QR encodes its ticket code.</p>
          </div>
          {tickets.length ?
          <ul className="max-h-[420px] overflow-y-auto">
              {tickets.map((t) =>
            <li key={t.id} className="flex items-center gap-3 border-b border-line p-3 text-sm last:border-0">
                  <button type="button" onClick={() => setQr(t)} aria-label={`Show QR for ${t.code}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line hover:border-ink"><QrCode className="h-4 w-4" aria-hidden="true" /></button>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold text-ink">{t.code}</p>
                    <p className="truncate text-xs text-smoke">{t.holderName} · {tiers.find((x) => x.id === t.tierId)?.name}{t.checkedInAt ? ` · in at ${fmtDateTime(t.checkedInAt)}` : ''}</p>
                  </div>
                  <StatusPill tone={TICKET[t.status].tone}>{TICKET[t.status].label}</StatusPill>
                </li>
            )}
            </ul> :
          <p className="p-6 text-center text-sm text-smoke">Tickets appear here after a successful (simulated) checkout.</p>}
        </section>
      </div>

      <TierDialog event={event} tier={dialog.tier} open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
      <Dialog open={!!qr} onOpenChange={(o) => !o && setQr(null)}>
        <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-sm">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display">{qr?.holderName}</DialogTitle>
            <DialogDescription>Demo ticket · {db.ticketTiers.find((x) => x.id === qr?.tierId)?.name}</DialogDescription>
          </DialogHeader>
          {qr && <div className="flex justify-center py-2"><TicketQr code={qr.code} size={180} /></div>}
        </DialogContent>
      </Dialog>
    </div>);

}