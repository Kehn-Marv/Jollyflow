import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { PageHero } from '../../components/marketing/PageHero';
import { VendorTimelineVisual } from '../../components/home/visuals/VendorTimelineVisual';
import { useDb } from '../../contexts/DataContext';
import { VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { formatNairaCompact } from '../../utils/money';
import { DemoTag } from '../../components/ui/DemoTag';
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
      <PageHero
        eyebrow="Vendors & bookings"
        title={<>From “send price” to settled balance.</>}
        body="Organisers find and book vendors with clear terms. Vendors get structured requests instead of scattered DMs. Everyone sees what’s owed and when."
        actions={<><Link to="/vendors" className={cx(btn.base, btn.lime, btn.lg)}>Browse vendors</Link><Link to="/signup" className={cx(btn.base, btn.onDark, btn.lg)}>Plan an event</Link></>}
        visual={<VendorTimelineVisual />} />
      
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
                <Link to={`/vendors/${v.id}`} className="group block overflow-hidden rounded-[1.4rem] border-2 border-ink bg-white shadow-pop transition hover:-translate-y-0.5">
                  <img src={v.portfolio[0]} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-coral">{VENDOR_CATEGORY_LABELS[v.category]}</p><DemoTag>Sample</DemoTag></div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink">{v.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-smoke"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{v.serviceAreas.join(', ')}</p>
                    <p className="mt-3 text-sm font-semibold text-ink">{formatNairaCompact(v.priceFrom)} – {formatNairaCompact(v.priceTo)}</p>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-lime">
        <div className="container grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">Are you a vendor?</h2>
          <div>
            <p className="text-ink/80">Vendor accounts with service listings, request inboxes and payment tracking are on our roadmap. In this prototype, organisers can record any vendor manually — no vendor account required.</p>
            <Link to="/about" className={cx(btn.base, btn.ink, btn.md, 'mt-5')}>See our roadmap</Link>
          </div>
        </div>
      </section>
    </>);

}