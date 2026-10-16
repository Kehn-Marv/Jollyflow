import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Pencil, ScanLine, Settings2, BoxIcon } from "lucide-react";
import { EventFeatures, EventRecord } from "../../types/domain";
import { EditEventDialog } from "./EditEventDialog";
import { ManageEventDialog } from "./ManageEventDialog";
import { cx } from "../../utils/styles";
const FEATURE_LABELS: Record<keyof EventFeatures, string> = {
  guests: 'Guest list & RSVPs',
  vendors: 'Vendors',
  gifting: 'Gift registry',
  tickets: 'Tickets',
  memories: 'Memories'
};
function Row({
  icon: Icon,
  title,
  body,
  onClick,
  to






}: {icon: BoxIcon;title: string;body: string;onClick?: () => void;to?: string;}) {
  const inner = <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper"><Icon className="h-4 w-4 text-ink" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-smoke">{body}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-smoke" aria-hidden="true" />
    </>;
  const cls = 'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-paper';
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}
export function SettingsTab({
  event


}: {event: EventRecord;}) {
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const features = Object.keys(FEATURE_LABELS) as Array<keyof EventFeatures>;
  return <div className="grid items-start gap-4 lg:grid-cols-[1.25fr_1fr]">
      <section aria-label="Event settings" className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
        <Row icon={Pencil} title="Edit details" body="Title, date, time, location and description" onClick={() => setEditOpen(true)} />
        <Row icon={Settings2} title="Status & visibility" body="Publish, make private, cancel or archive" onClick={() => setManageOpen(true)} />
        {event.features.tickets && <Row icon={ScanLine} title="Gate check-in" body="Scan or type ticket codes at the door" to={`/check-in/${event.id}`} />}
      </section>

      <section aria-labelledby="features-title" className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 id="features-title" className="font-display text-[15px] font-semibold text-ink">Features</h2>
        <p className="mt-0.5 text-xs text-smoke">Turn features on or off from Edit details.</p>
        <ul className="mt-4 space-y-2">
          {features.map((k) => <li key={k} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink">{FEATURE_LABELS[k]}</span>
              <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-medium', event.features[k] ? 'bg-lime/60 text-ink' : 'bg-paper text-smoke')}>{event.features[k] ? 'On' : 'Off'}</span>
            </li>)}
        </ul>
      </section>

      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
      <ManageEventDialog event={event} open={manageOpen} onOpenChange={setManageOpen} />
    </div>;
}