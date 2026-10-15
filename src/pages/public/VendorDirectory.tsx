import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Store } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { formatNairaCompact } from '../../utils/money';
import type { VendorCategory } from '../../types/domain';
import { NativeSelect } from '../../components/ui/FormField';
import { DemoTag } from '../../components/ui/DemoTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { cx, inputClass } from '../../utils/styles';

export function VendorDirectory({ inApp = false }: {inApp?: boolean;}) {
  const db = useDb();
  const [params] = useSearchParams();
  const eventQ = params.get('event');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [city, setCity] = useState('');
  const vendors = db.vendors.filter((v) => v.isMarketplace);
  const cities = Array.from(new Set(vendors.flatMap((v) => v.serviceAreas)));
  const list = useMemo(() => vendors.filter((v) => (!cat || v.category === cat) && (!city || v.serviceAreas.includes(city)) && (!q || `${v.name} ${v.tagline}`.toLowerCase().includes(q.toLowerCase()))), [vendors, q, cat, city]);
  const base = inApp ? '/app/vendors' : '/vendors';

  return (
    <div className={inApp ? 'space-y-6' : 'container space-y-6 py-12'}>
      <header>
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Vendor directory</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-smoke">Caterers, decorators, photographers, venues and more. <DemoTag>Fictional sample businesses</DemoTag></p>
      </header>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative"><label htmlFor="v-q" className="sr-only">Search vendors</label><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" /><input id="v-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendors" className={cx(inputClass, 'pl-9')} /></div>
        <NativeSelect aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All services</option>{(Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).map((c) => <option key={c} value={c}>{VENDOR_CATEGORY_LABELS[c]}</option>)}</NativeSelect>
        <NativeSelect aria-label="Location" value={city} onChange={(e) => setCity(e.target.value)}><option value="">All locations</option>{cities.map((c) => <option key={c}>{c}</option>)}</NativeSelect>
      </div>
      {list.length ?
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) =>
        <li key={v.id}>
              <Link to={`${base}/${v.id}${eventQ ? `?event=${eventQ}` : ''}`} className="group block overflow-hidden rounded-[1.4rem] border border-line bg-white transition hover:border-ink hover:shadow-pop">
                <img src={v.portfolio[0]} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs font-semibold text-coral">{VENDOR_CATEGORY_LABELS[v.category]}</p>
                  <h2 className="font-display text-lg font-semibold text-ink">{v.name}</h2>
                  <p className="text-sm text-smoke">{v.tagline}</p>
                  <div className="mt-3 flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-smoke"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{v.city}</span><span className="font-semibold">{formatNairaCompact(v.priceFrom)}+</span></div>
                </div>
              </Link>
            </li>
        )}
        </ul> :
      <EmptyState icon={Store} title="No vendors match" message="Try a different service or location." />}
    </div>);

}