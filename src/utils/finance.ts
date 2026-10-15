import type { Booking, DemoDatabase, ID, Kobo } from '../types/domain';
import { sumKobo } from './money';

/**
 * Financial definitions (shown to users in the Money explainer):
 * - Budget:      the total the organiser set for the event.
 * - Planned:     sum of category allocations (an intention, not money).
 * - Committed:   confirmed vendor bookings + budget items marked committed. Paid amounts are part of committed.
 * - Paid:        outgoing payments with status 'success' only.
 * - Pending out: outgoing payments awaiting confirmation. NOT counted as paid.
 * - Outstanding: committed − paid for each commitment (never negative).
 * - Received:    incoming contributions / gifts / ticket sales with status 'success' only.
 * - Remaining:   budget − committed. Incoming money is shown separately and never added to budget.
 */

export interface BookingFinance {
  agreed: Kobo;
  paid: Kobo;
  pending: Kobo;
  outstanding: Kobo;
  depositOutstanding: Kobo;
}

export interface CategorySummary {
  id: ID;
  name: string;
  planned: Kobo;
  estimates: Kobo;
  committed: Kobo;
  paid: Kobo;
}

export interface FinanceSummary {
  budget: Kobo;
  planned: Kobo;
  estimates: Kobo;
  committed: Kobo;
  paid: Kobo;
  pendingOut: Kobo;
  outstanding: Kobo;
  outstandingVendors: Kobo;
  received: Kobo;
  incomingPending: Kobo;
  failedCount: number;
  remaining: Kobo;
  overCommitted: boolean;
  categories: CategorySummary[];
}

export function bookingFinance(db: DemoDatabase, booking: Booking): BookingFinance {
  const txns = db.transactions.filter((t) => t.bookingId === booking.id && t.direction === 'out');
  const paid = sumKobo(txns.filter((t) => t.status === 'success').map((t) => t.amount));
  const pending = sumKobo(txns.filter((t) => t.status === 'pending').map((t) => t.amount));
  const outstanding = booking.status === 'confirmed' ? Math.max(0, booking.agreedAmount - paid) : 0;
  return {
    agreed: booking.agreedAmount,
    paid,
    pending,
    outstanding,
    depositOutstanding: Math.max(0, booking.depositAmount - paid)
  };
}

export function budgetItemPaid(db: DemoDatabase, itemId: ID): Kobo {
  return sumKobo(
    db.transactions.filter((t) => t.budgetItemId === itemId && t.direction === 'out' && t.status === 'success').map((t) => t.amount)
  );
}

export function summariseEvent(db: DemoDatabase, eventId: ID): FinanceSummary {
  const event = db.events.find((e) => e.id === eventId);
  const cats = db.budgetCategories.filter((c) => c.eventId === eventId);
  const items = db.budgetItems.filter((i) => i.eventId === eventId);
  const confirmed = db.bookings.filter((b) => b.eventId === eventId && b.status === 'confirmed');
  const txns = db.transactions.filter((t) => t.eventId === eventId);

  const committedItems = items.filter((i) => i.status === 'committed');
  const committed = sumKobo(committedItems.map((i) => i.amount)) + sumKobo(confirmed.map((b) => b.agreedAmount));
  const paid = sumKobo(txns.filter((t) => t.direction === 'out' && t.status === 'success').map((t) => t.amount));
  const pendingOut = sumKobo(txns.filter((t) => t.direction === 'out' && t.status === 'pending').map((t) => t.amount));
  const outstandingVendors = sumKobo(confirmed.map((b) => bookingFinance(db, b).outstanding));
  const outstandingItems = sumKobo(committedItems.map((i) => Math.max(0, i.amount - budgetItemPaid(db, i.id))));
  const budget = event?.budgetTotal ?? 0;

  const categories: CategorySummary[] = cats.map((c) => {
    const catItems = items.filter((i) => i.categoryId === c.id);
    const catBookings = confirmed.filter((b) => b.categoryId === c.id);
    const itemIds = new Set(catItems.map((i) => i.id));
    const bookingIds = new Set(catBookings.map((b) => b.id));
    return {
      id: c.id,
      name: c.name,
      planned: c.planned,
      estimates: sumKobo(catItems.filter((i) => i.status === 'estimate').map((i) => i.amount)),
      committed: sumKobo(catItems.filter((i) => i.status === 'committed').map((i) => i.amount)) + sumKobo(catBookings.map((b) => b.agreedAmount)),
      paid: sumKobo(
        txns.
        filter((t) => t.direction === 'out' && t.status === 'success' && (t.bookingId && bookingIds.has(t.bookingId) || t.budgetItemId && itemIds.has(t.budgetItemId))).
        map((t) => t.amount)
      )
    };
  });

  return {
    budget,
    planned: sumKobo(cats.map((c) => c.planned)),
    estimates: sumKobo(items.filter((i) => i.status === 'estimate').map((i) => i.amount)),
    committed,
    paid,
    pendingOut,
    outstanding: outstandingVendors + outstandingItems,
    outstandingVendors,
    received: sumKobo(txns.filter((t) => t.direction === 'in' && t.status === 'success').map((t) => t.amount)),
    incomingPending: sumKobo(txns.filter((t) => t.direction === 'in' && t.status === 'pending').map((t) => t.amount)),
    failedCount: txns.filter((t) => t.status === 'failed').length,
    remaining: budget - committed,
    overCommitted: committed > budget && budget > 0,
    categories
  };
}

export interface PortfolioFinance {
  budget: Kobo;
  committed: Kobo;
  paid: Kobo;
  outstanding: Kobo;
  received: Kobo;
  pendingOut: Kobo;
}

export function summarisePortfolio(db: DemoDatabase, eventIds: ID[]): PortfolioFinance {
  const s = eventIds.map((id) => summariseEvent(db, id));
  return {
    budget: sumKobo(s.map((x) => x.budget)),
    committed: sumKobo(s.map((x) => x.committed)),
    paid: sumKobo(s.map((x) => x.paid)),
    outstanding: sumKobo(s.map((x) => x.outstanding)),
    received: sumKobo(s.map((x) => x.received)),
    pendingOut: sumKobo(s.map((x) => x.pendingOut))
  };
}

export function giftRaised(db: DemoDatabase, giftId: ID): {raised: Kobo;pending: Kobo;contributors: number;} {
  const txns = db.transactions.filter((t) => t.giftItemId === giftId && t.direction === 'in');
  const ok = txns.filter((t) => t.status === 'success');
  return {
    raised: sumKobo(ok.map((t) => t.amount)),
    pending: sumKobo(txns.filter((t) => t.status === 'pending').map((t) => t.amount)),
    contributors: ok.length
  };
}