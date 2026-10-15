import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { eventTicketStats } from '../../utils/tickets';
import { fmtDateTime } from '../../utils/dates';
import type { CheckInResult } from '../../types/domain';
import { btn, cx, inputClass } from '../../utils/styles';

const RESULT = {
  valid: { icon: CheckCircle2, title: 'Valid — let them in', cls: 'bg-[#E1F1DE] text-ok border-ok' },
  already_checked_in: { icon: AlertTriangle, title: 'Already checked in', cls: 'bg-[#FFE7DF] text-[#9C3418] border-coral' },
  cancelled: { icon: XCircle, title: 'Ticket cancelled', cls: 'bg-[#FADBD4] text-danger border-danger' },
  invalid: { icon: XCircle, title: 'Invalid ticket code', cls: 'bg-[#FADBD4] text-danger border-danger' },
  wrong_event: { icon: XCircle, title: 'Ticket is for another event', cls: 'bg-[#FADBD4] text-danger border-danger' }
};

export function CheckIn() {
  const { eventId } = useParams();
  const db = useDb();
  const event = db.events.find((e) => e.id === eventId && e.managed);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  if (!event) return <div className="grid min-h-screen place-items-center bg-paper"><div className="text-center"><h1 className="text-2xl font-bold">Event not found</h1><Link to="/app" className={cx(btn.base, btn.ink, btn.md, 'mt-4')}>Dashboard</Link></div></div>;
  const stats = eventTicketStats(db, event.id);
  const samples = db.tickets.filter((t) => t.eventId === event.id).slice(0, 4);

  async function check(value: string) {
    if (!value.trim() || busy) return;
    setBusy(true);
    try {
      setResult(await service.checkInTicket(event!.id, value));
      setCode('');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }
  const r = result ? RESULT[result.outcome] : null;

  return (
    <div className="on-dark min-h-screen w-full bg-ink text-paper">
      <header className="container flex h-16 items-center justify-between"><Link to={`/app/events/${event.id}/tickets`} className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Link><span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">Gate check-in · demo</span></header>
      <main className="container max-w-lg py-6">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="mt-1 text-4xl font-bold text-lime" aria-live="polite">{stats.checkedIn}<span className="text-lg text-paper/60"> / {stats.sold} checked in</span></p>
        <form onSubmit={(e) => {e.preventDefault();check(code);}} className="mt-6 flex gap-2">
          <label htmlFor="ci-code" className="sr-only">Ticket code</label>
          <input ref={inputRef} id="ci-code" autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="JF-XXXX-XXXX" autoCapitalize="characters" className={cx(inputClass, 'h-14 font-mono text-lg uppercase')} />
          <button type="submit" disabled={busy} className={cx(btn.base, btn.lime, 'h-14 px-6')}>{busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : 'Check'}</button>
        </form>
        <p className="mt-2 text-xs text-paper/50">Camera scanning isn’t enabled in this prototype — type the code printed under the ticket’s QR.</p>
        {r && result &&
        <div role="status" aria-live="assertive" className={cx('mt-6 rounded-2xl border-2 p-5', r.cls)}>
            <r.icon className="h-8 w-8" aria-hidden="true" />
            <p className="mt-2 text-xl font-bold">{r.title}</p>
            <p className="font-mono text-sm">{result.code}</p>
            {result.ticket && <p className="mt-1 text-sm">{result.ticket.holderName} · {result.tierName}{result.outcome === 'already_checked_in' && result.ticket.checkedInAt ? ` · first used ${fmtDateTime(result.ticket.checkedInAt)}` : ''}</p>}
          </div>
        }
        {samples.length > 0 && <div className="mt-8"><p className="text-xs font-semibold uppercase tracking-wider text-paper/50">Sample codes (simulate a scan)</p><div className="mt-2 flex flex-wrap gap-2">{samples.map((t) => <button key={t.id} type="button" onClick={() => check(t.code)} className="rounded-full border border-paper/25 px-3 py-1.5 font-mono text-xs hover:border-lime">{t.code}</button>)}<button type="button" onClick={() => check('JF-FAKE-0000')} className="rounded-full border border-paper/25 px-3 py-1.5 font-mono text-xs hover:border-lime">JF-FAKE-0000</button></div></div>}
      </main>
    </div>);

}