import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { formatNaira } from '../../utils/money';
import { isPast } from '../../utils/dates';
import { BookingDialog } from '../../components/workspace/BookingDialog';
import { NativeSelect } from '../../components/ui/FormField';
import { DemoTag } from '../../components/ui/DemoTag';
import { Button } from '../../components/ui/Button';
import { btn, cx } from '../../utils/styles';

export function VendorProfile({ inApp = false }: {inApp?: boolean;}) {
  const { vendorId } = useParams();
  const [params] = useSearchParams();
  const db = useDb();
  const { user } = useAuth();
  const navigate = useNavigate();
  const vendor = db.vendors.find((v) => v.id === vendorId);
  const events = db.events.filter((e) => e.managed && (e.status === 'published' || e.status === 'draft') && !isPast(e.endsAt));
  const [eventId, setEventId] = useState(params.get('event') ?? events[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const event = events.find((e) => e.id === eventId);

  if (!vendor) return <div className="container py-20 text-center"><h1 className="text-2xl font-bold">Vendor not found</h1><Link to={inApp ? '/app/vendors' : '/vendors'} className={cx(btn.base, btn.ink, btn.md, 'mt-4')}>All vendors</Link></div>;
  const bookings = db.bookings.filter((b) => b.vendorId === vendor.id && events.some((e) => e.id === b.eventId));

  return (
    <div className={inApp ? 'space-y-6' : 'container space-y-6 py-12'}>
      <Link to={inApp ? '/app/vendors' : '/vendors'} className="text-sm font-semibold text-smoke hover:text-ink">← All vendors</Link>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="grid grid-cols-3 gap-2">{vendor.portfolio.map((p, i) => <img key={p + i} src={p} alt={`${vendor.name} portfolio ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className={cx('w-full rounded-xl object-cover', i === 0 ? 'col-span-3 aspect-[2/1]' : 'aspect-square')} />)}</div>
          <p className="mt-5 text-xs font-semibold text-coral">{VENDOR_CATEGORY_LABELS[vendor.category]}</p>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{vendor.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-smoke"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{vendor.serviceAreas.join(', ')}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{vendor.responseTime}</span><DemoTag>Sample — not verified</DemoTag></div>
          <p className="mt-4 text-lg text-ink/80">{vendor.description}</p>
          <h2 className="mt-8 text-xl font-bold">Services & indicative pricing</h2>
          <ul className="mt-3 space-y-2">{vendor.services.map((s) => <li key={s.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4"><span><span className="block font-semibold">{s.name}</span><span className="text-sm text-smoke">{s.description}</span></span><span className="whitespace-nowrap text-right font-semibold">{formatNaira(s.price)}<span className="block text-xs font-normal text-smoke">{s.unit}</span></span></li>)}</ul>
        </div>
        <aside className="h-fit rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Request a booking</h2>
          {!user ? <><p className="mt-2 text-sm text-smoke">Sign in or open the demo to send a booking request for one of your events.</p><Link to={`/signin?next=/app/vendors/${vendor.id}`} className={cx(btn.base, btn.ink, btn.md, 'mt-4 w-full')}>Sign in to book</Link></> : events.length ?
          <>
              <label htmlFor="vp-ev" className="mt-3 block text-sm font-medium">For event</label>
              <NativeSelect id="vp-ev" value={eventId} onChange={(e) => setEventId(e.target.value)}>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</NativeSelect>
              <Button type="button" onClick={() => setOpen(true)} disabled={!event} className={cx(btn.base, btn.lime, btn.md, 'mt-4 w-full')}>Send booking request</Button>
              <p className="mt-2 text-xs text-smoke">Requests are simulated; the vendor isn’t actually notified.</p>
              {bookings.length > 0 && <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">{bookings.map((b) => <li key={b.id}><button type="button" onClick={() => navigate(`/app/events/${b.eventId}/vendors?booking=${b.id}`)} className="text-left underline">{db.events.find((e) => e.id === b.eventId)?.title}: {b.status}</button></li>)}</ul>}
            </> :
          <p className="mt-2 text-sm text-smoke">Create an event first.</p>}
        </aside>
      </div>
      {event && <BookingDialog event={event} open={open} onOpenChange={(o) => {setOpen(o);}} vendorId={vendor.id} />}
    </div>);

}