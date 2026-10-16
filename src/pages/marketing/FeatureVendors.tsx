import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FeatureHero } from '../../components/marketing/FeatureHero';
import { BookingHeroVisual } from '../../components/marketing/visuals/BookingHeroVisual';
import { VendorCard } from '../../components/vendors/VendorCard';
import { useDb } from '../../contexts/DataContext';
import { btn, cx } from '../../utils/styles';

const LIFECYCLE = [
{ step: 'Discover', body: 'Browse by service and city, or record a vendor you already use.' },
{ step: 'Request', body: 'Send a booking request tied to a specific event and budget category.' },
{ step: 'Confirm', body: 'Once confirmed, the agreed amount becomes a commitment in the budget.' },
{ step: 'Deposit', body: 'Deposit due dates trigger alerts until the payment is confirmed.' },
{ step: 'Balance', body: 'Outstanding balances stay visible until fully settled.' }];


export function FeatureVendors() {
  const db = useDb();
  const vendors = db.vendors.filter((v) => v.isMarketplace).slice(0, 3);

  return (
    <>
      <FeatureHero
        kicker="For vendors"
        title={<>Book once. <span className="text-lime">Settle clean.</span></>}
        body="Clear terms, real deposit dates and one balance everyone agrees on — instead of “send price” threads and screenshot receipts."
        actions={<><Link to="/vendors" className={cx(btn.base, btn.lime, btn.lg)}>Browse vendors</Link><Link to="/signup" className={cx(btn.base, btn.onDark, btn.lg)}>Plan an event</Link></>}
        visual={<BookingHeroVisual />} />
      
      <section className="bg-paper">
        <div className="container py-20">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">The booking lifecycle</h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LIFECYCLE.map((l, i) =>
            <li key={l.step} className="rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-sky font-display text-sm font-bold">{i + 1}</span>
                <p className="mt-4 font-display text-lg font-semibold text-ink">{l.step}</p>
                <p className="mt-1 text-sm text-smoke">{l.body}</p>
              </li>
            )}
          </ol>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">Featured in the directory</h2>
              <p className="mt-2 text-smoke">Fictional businesses for demonstration.</p>
            </div>
            <Link to="/vendors" className="inline-flex items-center gap-2 font-semibold text-ink hover:underline">All vendors <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {vendors.map((v) =>
            <li key={v.id}>
                <VendorCard vendor={v} to={`/vendors/${v.id}`} />
              </li>
            )}
          </ul>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-lime">
        <div className="container grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">Are you a vendor?</h2>
          <div>
            <p className="text-ink/80">Vendor accounts with service listings, request inboxes and payment tracking are coming. Until then, organisers can record any vendor manually — no vendor account required.</p>
            <Link to="/vendors" className={cx(btn.base, btn.ink, btn.md, 'mt-5')}>Browse the directory</Link>
          </div>
        </div>
      </section>
    </>);

}