import React from "react";
import { Link } from "react-router-dom";
import { Banknote, CalendarCheck, CheckCircle2, Gift, Image as ImageIcon, Megaphone, PieChart, ScanLine, Store, Ticket, UserPlus, Users, BoxIcon } from "lucide-react";
import { Activity, ActivityKind } from "../../types/domain";
import { timeAgo } from "../../utils/dates";
import { useDb } from "../../contexts/DataContext";
const ICONS: Record<ActivityKind, BoxIcon> = {
  rsvp: CalendarCheck,
  booking: Store,
  task: CheckCircle2,
  payment: Banknote,
  guest: Users,
  gift: Gift,
  ticket: Ticket,
  checkin: ScanLine,
  announcement: Megaphone,
  event: CalendarCheck,
  collaborator: UserPlus,
  memory: ImageIcon,
  budget: PieChart
};
interface ActivityFeedProps {
  items: Activity[];
  showEvent?: boolean;
  emptyMessage?: string;
}
export function ActivityFeed({
  items,
  showEvent = false,
  emptyMessage = 'No activity yet.'
}: ActivityFeedProps) {
  const db = useDb();
  if (!items.length) return <p className="py-6 text-center text-sm text-smoke">{emptyMessage}</p>;
  return <ol className="relative space-y-1">
      {items.map((a) => {
      const Icon = ICONS[a.kind];
      const eventTitle = showEvent ? db.events.find((e) => e.id === a.eventId)?.title : null;
      const body = <>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-ink">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-snug text-ink">{a.message}</span>
              <span className="mt-0.5 block text-xs text-smoke">
                {timeAgo(a.createdAt)}
                {eventTitle ? ` · ${eventTitle}` : ''}
              </span>
            </span>
          </>;
      return <li key={a.id}>
            {a.link ? <Link to={a.link} className="flex gap-3 rounded-xl p-2 transition hover:bg-sand">
                {body}
              </Link> : <div className="flex gap-3 p-2">{body}</div>}
          </li>;
    })}
    </ol>;
}