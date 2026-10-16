import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Gift, Loader2, Lock, MapPin, Megaphone, Ticket } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { publicEventUrl, publicState, EVENT_TYPE_LABELS } from '../../utils/events';
import { fmtDate, fmtTime, timeAgo } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { giftRaised } from '../../utils/finance';
import { tierStats } from '../../utils/tickets';
import { isContact } from '../../utils/validation';
import { CopyButton } from '../../components/ui/CopyButton';
import { DemoTag } from '../../components/ui/DemoTag';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FormField, NativeSelect } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

export function PublicEvent() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const inviteId = params.get('invite');
  const db = useDb();
  const event = db.events.find((e) => e.slug === slug);
  const invited = event ? db.guests.find((g) => g.id === inviteId && g.eventId === event.id) : undefined;
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState(invited?.name ?? '');
  const [contact, setContact] = useState(invited?.contact ?? '');
  const [rsvp, setRsvp] = useState<'attending' | 'declined'>('attending');
  const [plus, setPlus] = useState('0');
  const [err, setErr] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);
  const [resName, setResName] = useState('');

  const shell = (children: React.ReactNode) =>
  <div className="min-h-screen w-full bg-paper">
      <header className="on-dark bg-ink"><div className="container flex h-14 items-center justify-between"><Link to="/" aria-label="JolliFlow home"><Logo tone="light" /></Link><Link to="/explore" className="text-sm font-semibold text-paper/80 hover:text-lime">Explore events</Link></div></header>
      <main>{children}</main>
    </div>;


  if (!event) return shell(<div className="container max-w-xl py-24 text-center"><h1 className="text-3xl font-bold">Event not found</h1><p className="mt-2 text-smoke">This link may be wrong or the event was removed.</p><Link to="/explore" className={cx(btn.base, btn.ink, btn.md, 'mt-6')}>Explore events</Link></div>);
  if (event.visibility === 'private' && !invited && !params.has('invite')) {
    return shell(<div className="container max-w-xl py-24 text-center"><Lock className="mx-auto h-10 w-10" aria-hidden="true" /><h1 className="mt-4 text-3xl font-bold">This event is private</h1><p className="mt-2 text-smoke">Ask the host for your personal invitation link.</p></div>);
  }
  const state = publicState(event);
  if (state === 'draft' || state === 'archived') return shell(<div className="container max-w-xl py-24 text-center"><h1 className="text-3xl font-bold">This event isn’t available</h1><p className="mt-2 text-smoke">The host hasn’t published it yet.</p></div>);

  const tiers = db.ticketTiers.filter((t) => t.eventId === event.id && t.status !== 'cancelled');
  const gifts = event.features.gifting ? db.giftItems.filter((g) => g.eventId === event.id) : [];
  const updates = db.announcements.filter((a) => a.eventId === event.id && a.isPublic);
  const open = state === 'open';

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    if (name.trim().length < 2) return setErr('Enter your name.');
    if (!invited && !isContact(contact)) return setErr('Enter an email or Nigerian phone number so the host can reach you.');
    setErr('');
    const res = await run(() => service.submitRsvp({ eventId: event.id, guestId: invited?.id ?? null, name, contact, rsvp, plusOnes: Number(plus), note: '' }));
    if (res) setDone(res.wasUpdate ? 'Your response has been updated.' : rsvp === 'attending' ? 'You’re on the list. See you there!' : 'Thanks for letting the host know.');
  }

  return shell(
    <>
      <section className="relative">
        <img src={event.coverUrl} alt="" decoding="async" className="h-56 w-full bg-sand object-cover sm:h-80" />
        {state === 'cancelled' && <p className="bg-danger px-4 py-2 text-center font-semibold text-white">This event has been cancelled.</p>}
        {state === 'ended' && <p className="bg-ink px-4 py-2 text-center font-semibold text-paper">This event has ended.</p>}
      </section>
      <div className="container grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">{EVENT_TYPE_LABELS[event.type]}</span>{event.isSample && <DemoTag>Sample event</DemoTag>}</div>
          <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">{event.title}</h1>
          <p className="mt-2 text-smoke">Hosted by {event.organiserName}</p>
          <div className="mt-5 space-y-2 text-ink">
            <p className="flex items-center gap-2"><CalendarDays className="h-5 w-5" aria-hidden="true" />{fmtDate(event.startsAt)} · {fmtTime(event.startsAt)} – {fmtTime(event.endsAt)}</p>
            <p className="flex items-center gap-2"><MapPin className="h-5 w-5" aria-hidden="true" />{event.venue}, {event.address ? `${event.address}, ` : ''}{event.city}</p>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-ink/80">{event.description}</p>
          <div className="mt-6"><CopyButton value={publicEventUrl(event)} label="Share event" share={{ title: event.title }} /></div>
          {updates.length > 0 &&
          <section className="mt-10"><h2 className="flex items-center gap-2 text-2xl font-bold"><Megaphone className="h-5 w-5" aria-hidden="true" />Updates</h2>
              <ul className="mt-4 space-y-3">{updates.map((a) => <li key={a.id} className="rounded-2xl border border-line bg-white p-4"><p className="font-semibold">{a.title}</p><p className="text-xs text-smoke">{timeAgo(a.createdAt)}</p><p className="mt-2 text-sm">{a.body}</p></li>)}</ul>
            </section>
          }
          {gifts.length > 0 &&
          <section id="gifts" className="mt-10 scroll-mt-20"><h2 className="flex items-center gap-2 text-2xl font-bold"><Gift className="h-5 w-5" aria-hidden="true" />Gifts</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{gifts.map((g) => {const r = giftRaised(db, g.id);return (
                  <li key={g.id} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-pop-sm">
                  <p className="font-semibold">{g.name}</p><p className="text-sm text-smoke">{g.description}</p>
                  {g.kind === 'cash_fund' ? <><ProgressBar value={r.raised} max={g.targetAmount ?? 1} label={`${g.name} progress`} className="mt-3" /><p className="mt-1 text-xs text-smoke">{formatNaira(r.raised)} of {formatNaira(g.targetAmount ?? 0)} confirmed</p>{open && <Link to={`/events/${event.slug}/checkout?gift=${g.id}`} className={cx(btn.base, btn.lime, btn.sm, 'mt-3')}>Contribute (simulated)</Link>}</> :
                    g.status === 'available' && open ? reserving === g.id ?
                    <form className="mt-3 flex gap-2" onSubmit={async (e) => {e.preventDefault();if (resName.trim().length < 2) return;const ok = await run(() => service.reserveGift(g.id, resName), { success: 'Reserved — thank you!' });if (ok) setReserving(null);}}>
                        <label htmlFor={`res-${g.id}`} className="sr-only">Your name</label><input id={`res-${g.id}`} value={resName} onChange={(e) => setResName(e.target.value)} placeholder="Your name" className={cx(inputClass, 'h-9')} /><Button type="submit" disabled={pending} className={cx(btn.base, btn.ink, btn.sm)}>Reserve</Button>
                      </form> : <Button type="button" onClick={() => {setResName('');setReserving(g.id);}} className={cx(btn.base, btn.outline, btn.sm, 'mt-3')}>I’ll bring this</Button> :
                    <p className="mt-3 text-xs font-semibold">{g.status === 'available' ? 'Available' : 'Already taken'}</p>
                    }
                </li>);})}</ul>
            </section>
          }
        </div>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {event.features.tickets && tiers.length > 0 &&
          <section className="rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Ticket className="h-5 w-5" aria-hidden="true" />Tickets</h2>
              <ul className="mt-3 space-y-2">{tiers.map((t) => {const s = tierStats(db, t.id);return <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper p-3"><span><span className="block font-semibold">{t.name}</span><span className="text-xs text-smoke">{s.soldOut ? 'Sold out' : t.status === 'paused' ? 'Paused' : `${s.remaining} left`}</span></span><span className="font-semibold">{t.price ? formatNaira(t.price) : 'Free'}</span></li>;})}</ul>
              {open ? <Link to={`/events/${event.slug}/checkout`} className={cx(btn.base, btn.lime, btn.lg, 'mt-4 w-full')}>Get tickets</Link> : <p className="mt-4 text-sm text-smoke">Ticket sales are closed.</p>}
              <p className="mt-2 text-xs text-smoke">Checkout is a simulation — no real payment is taken.</p>
            </section>
          }
          {event.features.guests && event.rsvpEnabled &&
          <section className="rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
              <h2 className="font-display text-xl font-semibold">{invited ? `Hi ${invited.name.split(' ')[0]}, will you come?` : 'RSVP'}</h2>
              {!open ? <p className="mt-2 text-sm text-smoke">RSVPs are closed.</p> : done ?
            <div role="status" className="mt-3 rounded-xl bg-[#E1F1DE] p-4 text-ok"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /><p className="mt-2 font-semibold">{done}</p><button type="button" onClick={() => setDone(null)} className="mt-2 text-sm underline">Change response</button></div> :

            <form onSubmit={submitRsvp} noValidate className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Response">
                    {(['attending', 'declined'] as const).map((r) => <button key={r} type="button" role="radio" aria-checked={rsvp === r} onClick={() => setRsvp(r)} className={cx('rounded-xl border-2 p-3 text-sm font-semibold', rsvp === r ? 'border-ink bg-lime' : 'border-line')}>{r === 'attending' ? 'I’ll be there' : 'Can’t make it'}</button>)}
                  </div>
                  <FormField label="Your name" htmlFor="rs-n"><input id="rs-n" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></FormField>
                  {!invited && <FormField label="Email or phone" htmlFor="rs-c" hint="Responding again with the same contact updates your RSVP."><input id="rs-c" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} aria-describedby="rs-c-hint" /></FormField>}
                  {event.plusOnesAllowed && rsvp === 'attending' && <FormField label="Bringing anyone?" htmlFor="rs-p"><NativeSelect id="rs-p" value={plus} onChange={(e) => setPlus(e.target.value)}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n === 0 ? 'Just me' : `+${n}`}</option>)}</NativeSelect></FormField>}
                  {err && <p role="alert" className="text-sm font-medium text-danger">{err}</p>}
                  <Button type="submit" disabled={pending} className={cx(btn.base, btn.ink, btn.lg, 'w-full')}>{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Send RSVP</Button>
                </form>
            }
            </section>
          }
          <p className="text-xs text-smoke">Guest lists, budgets and vendor details are never shown on this page.</p>
        </aside>
      </div>
    </>
  );
}