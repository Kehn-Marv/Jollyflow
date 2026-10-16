import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Megaphone } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { publicEventUrl } from '../../utils/events';
import { CopyButton } from '../ui/CopyButton';
import { UpdatesTab } from './UpdatesTab';
import { btn, cx } from '../../utils/styles';

/** Promotion: the shareable public page plus announcements to guests and the team. */
export function PromotionTab({ event }: {event: EventRecord;}) {
  const live = event.status === 'published';
  return (
    <div className="space-y-6">
      <section aria-labelledby="promo-share" className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime/60"><Megaphone className="h-4 w-4 text-ink" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 id="promo-share" className="font-display text-[15px] font-semibold text-ink">Share your event</h2>
            <p className="mt-0.5 truncate text-sm text-smoke">{live ? publicEventUrl(event) : 'Publish this event to get a shareable link.'}</p>
          </div>
        </div>
        {live ?
        <div className="flex shrink-0 flex-wrap gap-2">
            <CopyButton value={publicEventUrl(event)} label="Copy link" />
            <Link to={`/events/${event.slug}`} target="_blank" rel="noreferrer" className={cx(btn.base, btn.outline, btn.sm)}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Public page
            </Link>
          </div> :

        <Link to={`/app/events/${event.id}/settings`} className={cx(btn.base, btn.ink, btn.sm, 'shrink-0')}>Go to Settings</Link>
        }
      </section>
      <UpdatesTab event={event} />
    </div>);

}