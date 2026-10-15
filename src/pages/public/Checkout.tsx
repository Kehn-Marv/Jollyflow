import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Logo } from '../../components/brand/Logo';
import { useDb } from '../../contexts/DataContext';
import { payments, service } from '../../services';
import { formatNaira, parseNairaInput } from '../../utils/money';
import { createIdempotencyKey } from '../../utils/ids';
import { tierStats } from '../../utils/tickets';
import { publicState } from '../../utils/events';
import { isEmail } from '../../utils/validation';
import type { SettlementOutcome } from '../../services/contracts';
import type { Ticket } from '../../types/domain';
import { TicketQr } from '../../components/tickets/TicketQr';
import { FormField, MoneyInput, NativeSelect } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

type Phase = 'form' | 'processing' | 'success' | 'failed' | 'pending';

export function Checkout() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const giftId = params.get('gift');
  const db = useDb();
  const event = db.events.find((e) => e.slug === slug);
  const tiers = event ? db.ticketTiers.filter((t) => t.eventId === event.id && t.status === 'on_sale') : [];
  const gift = giftId ? db.giftItems.find((g) => g.id === giftId) : undefined;
  const [tierId, setTierId] = useState(tiers[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [agree, setAgree] = useState(false);
  const [simulate, setSimulate] = useState<SettlementOutcome>('success');
  const [phase, setPhase] = useState<Phase>('form');
  const [err, setErr] = useState('');
  const [issued, setIssued] = useState<Ticket[]>([]);
  const [ref, setRef] = useState<{kind: 'order' | 'txn';id: string;} | null>(null);
  const key = useMemo(() => createIdempotencyKey(), []);

  if (!event || publicState(event) !== 'open') {
    return <div className="grid min-h-screen place-items-center bg-paper p-6 text-center"><div><h1 className="text-3xl font-bold">Checkout unavailable</h1><p className="mt-2 text-smoke">This event isn’t open for purchases.</p><Link to={event ? `/events/${event.slug}` : '/explore'} className={cx(btn.base, btn.ink, btn.md, 'mt-6')}>Back</Link></div></div>;
  }
  const tier = tiers.find((t) => t.id === tierId);
  const stats = tier ? tierStats(db, tier.id) : null;
  const total = gift ? parseNairaInput(amount) ?? 0 : (tier?.price ?? 0) * qty;

  async function pay() {
    if (!event) return;
    if (name.trim().length < 2 || !isEmail(email)) return setErr('Enter your name and a valid email.');
    if (!gift && (!tier || !stats || stats.remaining < qty)) return setErr('Not enough tickets left.');
    if (gift && total < 10000) return setErr('Enter at least ₦100.');
    if (!agree) return setErr('Please accept the terms.');
    setErr('');
    setPhase('processing');
    try {
      let current = ref;
      if (!current) {
        if (gift) current = { kind: 'txn', id: (await service.startPublicContribution({ eventId: event.id, giftItemId: gift.id, name, amount: total, note: '' })).id };else
        current = { kind: 'order', id: (await service.createTicketOrder({ eventId: event.id, tierId, quantity: qty, buyerName: name, buyerEmail: email, idempotencyKey: key })).id };
        setRef(current);
      }
      const result = await payments.initiate({ reference: current.id, amount: total, description: event.title, payerName: name, simulate });
      if (current.kind === 'order') {
        const r = await service.settleTicketOrder(current.id, result.status);
        setIssued(r.tickets);
      } else await service.settleTransaction(current.id, result.status);
      setPhase(result.status === 'success' ? 'success' : result.status === 'failed' ? 'failed' : 'pending');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
      setPhase('form');
    }
  }

  return (
    <div className="min-h-screen w-full bg-paper">
      <header className="on-dark bg-ink"><div className="container flex h-14 items-center justify-between"><Link to="/"><Logo tone="light" /></Link><span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">SIMULATED CHECKOUT</span></div></header>
      <main className="container grid max-w-4xl gap-6 py-10 md:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[1.4rem] border-2 border-ink bg-white p-6 shadow-pop">
          <Link to={`/events/${event.slug}`} className="text-sm font-semibold text-smoke hover:text-ink">← {event.title}</Link>
          {phase === 'success' ?
          <div role="status" className="mt-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-forest" aria-hidden="true" />
              <h1 className="mt-3 text-2xl font-bold">{gift ? 'Contribution confirmed' : 'You’re in!'}</h1>
              <p className="mt-1 text-sm text-smoke">Simulated payment — no money moved. Reference {ref?.id}</p>
              {issued.length > 0 && <div className="mt-6 flex flex-wrap justify-center gap-4">{issued.map((t) => <TicketQr key={t.id} code={t.code} size={120} />)}</div>}
              <Link to={`/events/${event.slug}`} className={cx(btn.base, btn.ink, btn.md, 'mt-6')}>Back to event</Link>
            </div> :
          phase === 'failed' || phase === 'pending' ?
          <div role="alert" className="mt-4 text-center">
              {phase === 'failed' ? <AlertTriangle className="mx-auto h-12 w-12 text-danger" aria-hidden="true" /> : <Clock className="mx-auto h-12 w-12 text-coral" aria-hidden="true" />}
              <h1 className="mt-3 text-2xl font-bold">{phase === 'failed' ? 'Payment declined (simulated)' : 'Still waiting for confirmation'}</h1>
              <p className="mt-1 text-sm text-smoke">{phase === 'failed' ? 'Nothing was charged and no tickets were issued.' : 'Your order is pending — it is not counted as paid until confirmed.'}</p>
              <div className="mt-4"><FormField label="Simulate next attempt" htmlFor="sim2"><NativeSelect id="sim2" value={simulate} onChange={(e) => setSimulate(e.target.value as SettlementOutcome)}><option value="success">Success</option><option value="failed">Failure</option><option value="timeout">Timeout</option></NativeSelect></FormField></div>
              <Button type="button" onClick={pay} className={cx(btn.base, btn.lime, btn.md, 'mt-4')}>Retry payment</Button>
            </div> :

          <form onSubmit={(e) => {e.preventDefault();pay();}} noValidate className="mt-4 space-y-4">
              <h1 className="text-2xl font-bold">{gift ? `Contribute to ${gift.name}` : 'Get tickets'}</h1>
              {gift ? <FormField label="Amount" htmlFor="co-amt"><MoneyInput id="co-amt" value={amount} onChange={(e) => setAmount(e.target.value)} /></FormField> :
            <div className="grid grid-cols-[1fr_6rem] gap-3">
                  <FormField label="Ticket" htmlFor="co-tier"><NativeSelect id="co-tier" value={tierId} onChange={(e) => {setTierId(e.target.value);setQty(1);}}>{tiers.map((t) => {const s = tierStats(db, t.id);return <option key={t.id} value={t.id} disabled={s.soldOut}>{t.name} — {formatNaira(t.price)}{s.soldOut ? ' (sold out)' : ''}</option>;})}</NativeSelect></FormField>
                  <FormField label="Qty" htmlFor="co-qty"><NativeSelect id="co-qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>{Array.from({ length: Math.min(tier?.maxPerOrder ?? 1, stats?.remaining ?? 0) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</NativeSelect></FormField>
                </div>
            }
              <FormField label="Full name" htmlFor="co-name"><input id="co-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></FormField>
              <FormField label="Email" htmlFor="co-email"><input id="co-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></FormField>
              <FormField label="Simulated outcome (demo only)" htmlFor="sim"><NativeSelect id="sim" value={simulate} onChange={(e) => setSimulate(e.target.value as SettlementOutcome)}><option value="success">Success</option><option value="failed">Failure</option><option value="timeout">Timeout / pending</option></NativeSelect></FormField>
              <label className="flex items-start gap-2 text-sm text-smoke"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-ink" /> I understand this is a simulated payment and agree to the <Link to="/terms" className="underline">prototype terms</Link>.</label>
              {err && <p role="alert" className="text-sm font-medium text-danger">{err}</p>}
              <Button type="submit" disabled={phase === 'processing'} aria-busy={phase === 'processing'} className={cx(btn.base, btn.lime, btn.lg, 'w-full')}>{phase === 'processing' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{phase === 'processing' ? 'Processing…' : `Pay ${formatNaira(total)} (simulated)`}</Button>
            </form>
          }
        </section>
        <aside className="h-fit rounded-[1.4rem] border border-line bg-white p-5">
          <img src={event.coverUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
          <h2 className="mt-3 font-display text-lg font-semibold">{event.title}</h2>
          <dl className="mt-3 space-y-1 text-sm"><div className="flex justify-between"><dt className="text-smoke">{gift ? gift.name : `${qty} × ${tier?.name ?? ''}`}</dt><dd>{formatNaira(total)}</dd></div><div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd>{formatNaira(total)}</dd></div></dl>
          <p className="mt-3 text-xs text-smoke">No card or bank details are collected. Real payments will be processed server-side by a licensed provider later.</p>
        </aside>
      </main>
    </div>);

}