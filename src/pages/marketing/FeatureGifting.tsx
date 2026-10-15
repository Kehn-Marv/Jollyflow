import React from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Gift, PackageCheck } from 'lucide-react';
import { PageHero } from '../../components/marketing/PageHero';
import { GiftVisual } from '../../components/home/visuals/GiftVisual';
import { useDb } from '../../contexts/DataContext';
import { giftRaised } from '../../utils/finance';
import { formatNaira } from '../../utils/money';
import { timeAgo } from '../../utils/dates';
import { PAYMENT_LABEL, PAYMENT_TONE, StatusPill } from '../../components/ui/StatusPill';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { btn, cx } from '../../utils/styles';

const RULES = [
{ icon: PackageCheck, title: 'Reserved is not received', body: 'A guest reserving a gift tells others it’s taken. Only the host marks it received.' },
{ icon: Banknote, title: 'Only confirmed money counts', body: 'Pending and failed contributions are shown, but never added to a fund’s total.' },
{ icon: Gift, title: 'Every gift has a name', body: 'Hosts see who gave what, so thank-you notes write themselves.' }];


export function FeatureGifting() {
  const db = useDb();
  const items = db.giftItems.filter((g) => g.eventId === 'e_birthday');
  const ledger = db.transactions.filter((t) => t.eventId === 'e_birthday' && t.direction === 'in').slice(0, 5);

  return (
    <>
      <PageHero
        tone="pink"
        eyebrow="Gifting & contributions"
        title={<>Gifts people actually want. Contributions you can trace.</>}
        body="Build a wishlist of physical gifts and cash funds. Guests reserve or contribute from the event page; you get a clean record of every gift."
        actions={<><Link to="/signup" className={cx(btn.base, btn.ink, btn.lg)}>Create a wishlist</Link><Link to="/events/kemi-turns-30" className={cx(btn.base, btn.outline, btn.lg)}>See a sample gift page</Link></>}
        visual={<GiftVisual />} />
      
      <section className="bg-paper">
        <div className="container py-20">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">A wishlist with two kinds of gifts</h2>
          <p className="mt-3 text-smoke">From the sample birthday: physical items guests can reserve, and cash funds with targets.</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((g) => {
              const r = giftRaised(db, g.id);
              return (
                <li key={g.id} className="flex flex-col rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
                  <StatusPill tone={g.kind === 'cash_fund' ? 'lime' : 'info'} className="self-start">{g.kind === 'cash_fund' ? 'Cash fund' : 'Physical gift'}</StatusPill>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{g.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-smoke">{g.description}</p>
                  {g.kind === 'cash_fund' && g.targetAmount ?
                  <div className="mt-4">
                      <ProgressBar value={r.raised} max={g.targetAmount} label={`${g.name} progress`} />
                      <p className="mt-2 text-xs text-smoke">{formatNaira(r.raised)} of {formatNaira(g.targetAmount)}</p>
                    </div> :

                  <p className="mt-4 text-xs font-semibold text-ink">{g.status === 'reserved' ? `Reserved by ${g.reservedBy}` : g.status === 'received' ? 'Received' : 'Available to reserve'}</p>
                  }
                </li>);

            })}
          </ul>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">Rules that keep it honest</h2>
            <ul className="mt-8 space-y-4">
              {RULES.map(({ icon: Icon, title, body }) =>
              <li key={title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-bloom"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span><span className="block font-semibold text-ink">{title}</span><span className="text-sm text-smoke">{body}</span></span>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-[1.6rem] border-2 border-ink bg-paper p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-smoke">Contribution record · sample · simulated</p>
            <ul className="mt-3 space-y-2">
              {ledger.map((t) =>
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{t.counterparty}</span>
                    <span className="block text-xs text-smoke">{db.giftItems.find((g) => g.id === t.giftItemId)?.name ?? 'General contribution'} · {timeAgo(t.createdAt)}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatNaira(t.amount)}</span>
                  <StatusPill tone={PAYMENT_TONE[t.status]}>{PAYMENT_LABEL[t.status]}</StatusPill>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>);

}