import type { DemoDatabase, ID, Kobo } from '../types/domain';
import { sumKobo } from './money';

export interface TierStats {
  sold: number;
  remaining: number;
  soldOut: boolean;
  checkedIn: number;
}

export function tierStats(db: DemoDatabase, tierId: ID): TierStats {
  const tier = db.ticketTiers.find((t) => t.id === tierId);
  const active = db.tickets.filter((t) => t.tierId === tierId && t.status !== 'cancelled');
  const sold = active.length;
  const remaining = Math.max(0, (tier?.quantity ?? 0) - sold);
  return { sold, remaining, soldOut: remaining === 0, checkedIn: active.filter((t) => t.status === 'checked_in').length };
}

export function eventTicketStats(db: DemoDatabase, eventId: ID): {sold: number;capacity: number;checkedIn: number;revenue: Kobo;} {
  const tiers = db.ticketTiers.filter((t) => t.eventId === eventId && t.status !== 'cancelled');
  const tickets = db.tickets.filter((t) => t.eventId === eventId && t.status !== 'cancelled');
  return {
    sold: tickets.length,
    capacity: tiers.reduce((a, t) => a + t.quantity, 0),
    checkedIn: tickets.filter((t) => t.status === 'checked_in').length,
    revenue: sumKobo(
      db.transactions.filter((t) => t.eventId === eventId && t.kind === 'ticket_sale' && t.status === 'success').map((t) => t.amount)
    )
  };
}