import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Vendor } from '../../types/domain';
import { VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { formatNairaCompact } from '../../utils/money';
import { SmartImage } from '../ui/SmartImage';
import { cx } from '../../utils/styles';

interface VendorCardProps {
  vendor: Vendor;
  to: string;
  className?: string;
}

/** Shares the event card's inset image frame and quiet stat strip. */
export function VendorCard({ vendor, to, className }: VendorCardProps) {
  return (
    <Link
      to={to}
      className={cx(
        'group flex h-full flex-col rounded-3xl border border-line bg-white p-3 transition duration-300 hover:border-ink/25 hover:shadow-[0_12px_32px_-16px_rgba(16,17,15,0.22)] focus-visible:border-ink',
        className
      )}>
      
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <SmartImage src={vendor.portfolio[0]} className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur transition-colors duration-300 group-hover:bg-lime group-focus-visible:bg-lime">
          {VENDOR_CATEGORY_LABELS[vendor.category]}
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
            <span className="flex items-center overflow-hidden whitespace-nowrap">
              <span className="px-1 text-ink/40" aria-hidden="true">·</span>View profile
              <ArrowUpRight className="ml-0.5 h-3 w-3" aria-hidden="true" />
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
        <h3 className="line-clamp-1 font-display text-[17px] font-semibold leading-snug text-ink">{vendor.name}</h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-smoke">{vendor.tagline}</p>
        <dl className="mt-4 grid grid-cols-2 divide-x divide-line rounded-2xl bg-paper py-2.5">
          <div className="min-w-0 pl-3.5 pr-3">
            <dt className="text-[11px] text-smoke">Based in</dt>
            <dd className="mt-0.5 flex items-center gap-1 truncate text-sm font-semibold text-ink">
              <MapPin className="h-3 w-3 shrink-0 text-smoke" aria-hidden="true" />
              {vendor.city}
            </dd>
          </div>
          <div className="min-w-0 px-3">
            <dt className="text-[11px] text-smoke">Starting from</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-ink">{formatNairaCompact(vendor.priceFrom)}</dd>
          </div>
        </dl>
      </div>
    </Link>);

}