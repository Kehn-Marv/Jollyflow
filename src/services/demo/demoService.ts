import type { JolliFlowService } from '../contracts';
import type { Activity, DemoDatabase, EventRecord, ID, Ticket, Transaction } from '../../types/domain';
import { demoStore } from './demoStore';
import { demoAuth } from './demoAuth';
import { createId, createReference, createTicketCode, normaliseTicketCode, slugify } from '../../utils/ids';
import { bookingFinance, giftRaised } from '../../utils/finance';
import { normaliseContact, rsvpSummary } from '../../utils/rsvp';
import { tierStats } from '../../utils/tickets';
import { formatNaira } from '../../utils/money';
import { isPast } from '../../utils/dates';

/** Simulated network latency so loading states are visible and double-submits are prevented. */
const wait = (ms = 320) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();
const actor = () => demoAuth.getSession()?.name ?? 'Guest';

class DemoServiceError extends Error {}

function find<T extends {id: ID;}>(list: T[], id: ID, label: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new DemoServiceError(`${label} not found. It may have been removed.`);
  return item;
}

function log(db: DemoDatabase, eventId: ID, kind: Activity['kind'], message: string, link: string | null, who = actor()) {
  db.activities.unshift({ id: createId('a'), eventId, kind, message, actor: who, createdAt: nowIso(), link });
  if (db.activities.length > 250) db.activities.length = 250;
}

function uniqueSlug(db: DemoDatabase, title: string): string {
  const base = slugify(title) || 'event';
  let slug = base;
  let n = 2;
  while (db.events.some((e) => e.slug === slug)) slug = `${base}-${n++}`;
  return slug;
}

function assertBookable(event: EventRecord) {
  if (event.status === 'cancelled') throw new DemoServiceError('This event has been cancelled.');
  if (event.status !== 'published') throw new DemoServiceError('This event is not open yet.');
  if (isPast(event.endsAt)) throw new DemoServiceError('This event has already ended.');
}

function newTxn(p: Pick<Transaction, 'eventId' | 'direction' | 'kind' | 'amount' | 'status' | 'counterparty'> & Partial<Transaction>): Transaction {
  const ts = nowIso();
  return {
    id: createId('tx'), reference: createReference(), note: '', bookingId: null, budgetItemId: null, giftItemId: null,
    ticketOrderId: null, simulated: true, createdAt: ts, updatedAt: ts, ...p
  };
}

export const demoService: JolliFlowService = {
  /* ---------------- Events ---------------- */
  async createEvent(input) {
    await wait(600);
    return demoStore.update((db) => {
      const id = createId('e');
      const user = demoAuth.getSession();
      const event: EventRecord = {
        id, slug: uniqueSlug(db, input.title), title: input.title.trim(), type: input.type, description: input.description.trim(),
        startsAt: input.startsAt, endsAt: input.endsAt, timezone: 'Africa/Lagos', venue: input.venue.trim(), city: input.city,
        address: input.address.trim(), coverUrl: input.coverUrl, status: input.publish ? 'published' : 'draft',
        visibility: input.visibility, rsvpEnabled: input.rsvpEnabled, capacity: input.capacity, plusOnesAllowed: input.plusOnesAllowed,
        budgetTotal: input.budgetTotal, features: input.features, organiserName: user?.businessName || user?.name || 'Organiser',
        managed: true, isSample: false, createdAt: nowIso()
      };
      db.events.unshift(event);
      db.collaborators.push({ id: createId('c'), eventId: id, name: user?.name ?? 'You', email: user?.email ?? '', role: 'owner', status: 'active', isYou: true });
      input.collaborators.forEach((c) => db.collaborators.push({ id: createId('c'), eventId: id, ...c, status: 'invited', isYou: false }));
      input.categories.forEach((c) => db.budgetCategories.push({ id: createId('bc'), eventId: id, name: c.name, planned: c.planned }));
      if (input.features.tickets && input.ticketTier) {
        db.ticketTiers.push({ id: createId('tt'), eventId: id, description: '', maxPerOrder: 6, status: 'on_sale', ...input.ticketTier });
      }
      log(db, id, 'event', `${event.title} was created${input.publish ? ' and published' : ' as a draft'}`, `/app/events/${id}`);
      return event;
    });
  },

  async updateEvent(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const ev = find(db.events, id, 'Event');
      Object.assign(ev, patch);
      log(db, id, 'event', 'Event details were updated', `/app/events/${id}`);
      return ev;
    });
  },

  async setEventStatus(id, status) {
    await wait();
    return demoStore.update((db) => {
      const ev = find(db.events, id, 'Event');
      ev.status = status;
      const verb = { draft: 'moved back to draft', published: 'published', cancelled: 'cancelled', archived: 'archived' }[status];
      log(db, id, 'event', `${ev.title} was ${verb}`, `/app/events/${id}`);
      return ev;
    });
  },

  async deleteEvent(id) {
    await wait(500);
    demoStore.update((db) => {
      find(db.events, id, 'Event');
      const keep = <T extends {eventId: ID;},>(arr: T[]) => arr.filter((x) => x.eventId !== id);
      db.events = db.events.filter((e) => e.id !== id);
      db.collaborators = keep(db.collaborators);
      db.tasks = keep(db.tasks);
      db.guests = keep(db.guests);
      db.bookings = keep(db.bookings);
      db.budgetCategories = keep(db.budgetCategories);
      db.budgetItems = keep(db.budgetItems);
      db.transactions = keep(db.transactions);
      db.giftItems = keep(db.giftItems);
      db.ticketTiers = keep(db.ticketTiers);
      db.ticketOrders = keep(db.ticketOrders);
      db.tickets = keep(db.tickets);
      db.memories = keep(db.memories);
      db.activities = keep(db.activities);
      db.announcements = keep(db.announcements);
    });
  },

  /* ---------------- Collaboration ---------------- */
  async inviteCollaborator(eventId, input) {
    await wait();
    return demoStore.update((db) => {
      const email = input.email.trim().toLowerCase();
      if (db.collaborators.some((c) => c.eventId === eventId && c.email.toLowerCase() === email)) {
        throw new DemoServiceError('This person is already on the team.');
      }
      const c = { id: createId('c'), eventId, name: input.name.trim(), email, role: input.role, status: 'invited' as const, isYou: false };
      db.collaborators.push(c);
      log(db, eventId, 'collaborator', `${c.name} was invited to the team (simulated invite)`, `/app/events/${eventId}/updates`);
      return c;
    });
  },

  async removeCollaborator(id) {
    await wait();
    demoStore.update((db) => {
      const c = find(db.collaborators, id, 'Collaborator');
      if (c.isYou) throw new DemoServiceError('You can’t remove yourself.');
      db.collaborators = db.collaborators.filter((x) => x.id !== id);
      db.tasks.forEach((t) => {if (t.assigneeId === id) t.assigneeId = null;});
      log(db, c.eventId, 'collaborator', `${c.name} was removed from the team`, `/app/events/${c.eventId}/updates`);
    });
  },

  async postAnnouncement(input) {
    await wait();
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      const a = { id: createId('an'), ...input, title: input.title.trim(), body: input.body.trim(), author: actor(), createdAt: nowIso() };
      db.announcements.unshift(a);
      log(db, ev.id, 'announcement', `Update posted: “${a.title}”${a.isPublic ? ' (public)' : ' (team only)'}`, `/app/events/${ev.id}/updates`);
      return a;
    });
  },

  async deleteAnnouncement(id) {
    await wait();
    demoStore.update((db) => {
      db.announcements = db.announcements.filter((a) => a.id !== id);
    });
  },

  /* ---------------- Tasks ---------------- */
  async createTask(input) {
    await wait();
    return demoStore.update((db) => {
      const task = { id: createId('t'), ...input, title: input.title.trim(), status: input.status ?? 'todo', createdAt: nowIso(), completedAt: null };
      db.tasks.push(task);
      log(db, input.eventId, 'task', `Task added: “${task.title}”`, `/app/events/${input.eventId}/plan?task=${task.id}`);
      return task;
    });
  },

  async updateTask(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const t = find(db.tasks, id, 'Task');
      Object.assign(t, patch);
      if (patch.status) t.completedAt = patch.status === 'done' ? t.completedAt ?? nowIso() : null;
      return t;
    });
  },

  async setTaskStatus(id, status) {
    await wait(200);
    return demoStore.update((db) => {
      const t = find(db.tasks, id, 'Task');
      t.status = status;
      t.completedAt = status === 'done' ? nowIso() : null;
      if (status === 'done') log(db, t.eventId, 'task', `${actor()} completed “${t.title}”`, `/app/events/${t.eventId}/plan?task=${t.id}`);
      return t;
    });
  },

  async deleteTask(id) {
    await wait();
    demoStore.update((db) => {
      db.tasks = db.tasks.filter((t) => t.id !== id);
    });
  },

  /* ---------------- Guests & RSVP ---------------- */
  async addGuest(input) {
    await wait();
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      const contact = normaliseContact(input.contact);
      if (contact && db.guests.some((g) => g.eventId === ev.id && normaliseContact(g.contact) === contact)) {
        throw new DemoServiceError('A guest with this contact is already on the list.');
      }
      const guest = {
        id: createId('g'), ...input, name: input.name.trim(), contact: input.contact.trim(),
        plusOnes: ev.plusOnesAllowed ? Math.max(0, Math.min(5, input.plusOnes)) : 0,
        invitation: 'not_sent' as const, respondedAt: input.rsvp === 'pending' ? null : nowIso(), source: 'organiser' as const, createdAt: nowIso()
      };
      db.guests.push(guest);
      log(db, ev.id, 'guest', `${guest.name} was added to the guest list`, `/app/events/${ev.id}/guests`);
      return guest;
    });
  },

  async updateGuest(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const g = find(db.guests, id, 'Guest');
      const prev = g.rsvp;
      Object.assign(g, patch);
      if (patch.rsvp && patch.rsvp !== prev) {
        g.respondedAt = patch.rsvp === 'pending' ? null : nowIso();
        if (patch.rsvp !== 'pending') log(db, g.eventId, 'rsvp', `${g.name} marked as ${patch.rsvp} by organiser`, `/app/events/${g.eventId}/guests`);
      }
      return g;
    });
  },

  async deleteGuest(id) {
    await wait();
    demoStore.update((db) => {
      db.guests = db.guests.filter((g) => g.id !== id);
    });
  },

  async setInvitationStatus(ids, status) {
    await wait(450);
    demoStore.update((db) => {
      const set = new Set(ids);
      const affected = db.guests.filter((g) => set.has(g.id));
      affected.forEach((g) => {g.invitation = status;});
      if (affected[0] && status === 'simulated_sent') {
        log(db, affected[0].eventId, 'guest', `${affected.length} invitation${affected.length > 1 ? 's' : ''} marked as sent (simulated — no message delivered)`, `/app/events/${affected[0].eventId}/guests`);
      }
    });
  },

  async submitRsvp(input) {
    await wait(700);
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      assertBookable(ev);
      if (!ev.rsvpEnabled) throw new DemoServiceError('RSVPs are closed for this event.');
      const plusOnes = ev.plusOnesAllowed && input.rsvp === 'attending' ? Math.max(0, Math.min(3, input.plusOnes)) : 0;
      const contact = normaliseContact(input.contact);
      let guest =
      (input.guestId ? db.guests.find((g) => g.id === input.guestId && g.eventId === ev.id) : undefined) ?? (
      contact ? db.guests.find((g) => g.eventId === ev.id && normaliseContact(g.contact) === contact) : undefined);

      if (input.rsvp === 'attending' && ev.capacity) {
        const s = rsvpSummary(db.guests.filter((g) => g.eventId === ev.id && g.id !== guest?.id));
        if (s.headcount + 1 + plusOnes > ev.capacity) throw new DemoServiceError('Sorry — this event has reached capacity.');
      }

      const wasUpdate = Boolean(guest);
      if (guest) {
        guest.rsvp = input.rsvp;
        guest.plusOnes = plusOnes;
        guest.note = input.note || guest.note;
        guest.respondedAt = nowIso();
        if (!guest.contact && input.contact) guest.contact = input.contact.trim();
      } else {
        guest = {
          id: createId('g'), eventId: ev.id, name: input.name.trim(), contact: input.contact.trim(), group: 'Public RSVP',
          rsvp: input.rsvp, invitation: 'not_sent', plusOnes, note: input.note, respondedAt: nowIso(), source: 'public_rsvp', createdAt: nowIso()
        };
        db.guests.push(guest);
      }
      log(db, ev.id, 'rsvp', `${guest.name} ${input.rsvp === 'attending' ? `is attending${plusOnes ? ` (+${plusOnes})` : ''}` : 'can’t make it'}${wasUpdate ? ' (updated response)' : ''}`, `/app/events/${ev.id}/guests`, guest.name);
      return { guest: { ...guest }, wasUpdate };
    });
  },

  /* ---------------- Vendors & bookings ---------------- */
  async addManualVendor(input) {
    await wait();
    return demoStore.update((db) => {
      const v = {
        id: createId('v'), name: input.name.trim(), category: input.category, tagline: 'Recorded by organiser',
        description: input.description.trim() || 'Vendor recorded manually by the organiser.', city: input.city,
        serviceAreas: [input.city], priceFrom: 0, priceTo: 0, portfolio: [], services: [], contact: input.contact.trim(),
        responseTime: 'Offline vendor', isMarketplace: false, isSample: false, createdAt: nowIso()
      };
      db.vendors.push(v);
      return v;
    });
  },

  async requestBooking(input) {
    await wait(600);
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      const vendor = find(db.vendors, input.vendorId, 'Vendor');
      if (input.depositAmount > input.agreedAmount) throw new DemoServiceError('Deposit can’t be larger than the agreed amount.');
      const b = { id: createId('bk'), ...input, serviceName: input.serviceName.trim(), createdAt: nowIso() };
      db.bookings.push(b);
      if (!ev.features.vendors) ev.features.vendors = true;
      log(db, ev.id, 'booking', input.status === 'requested' ? `Booking request sent to ${vendor.name} (simulated)` : `${vendor.name} recorded as a confirmed booking`, `/app/events/${ev.id}/vendors?booking=${b.id}`);
      return b;
    });
  },

  async setBookingStatus(id, status) {
    await wait();
    return demoStore.update((db) => {
      const b = find(db.bookings, id, 'Booking');
      const vendor = db.vendors.find((v) => v.id === b.vendorId);
      if (status === 'cancelled' && bookingFinance(db, b).paid > 0) {
        b.notes = `${b.notes}\nCancelled after payments were made — refunds must be agreed with the vendor.`.trim();
      }
      b.status = status;
      log(db, b.eventId, 'booking', `${vendor?.name ?? 'Vendor'} booking is now ${status}`, `/app/events/${b.eventId}/vendors?booking=${b.id}`);
      return b;
    });
  },

  async updateBooking(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const b = find(db.bookings, id, 'Booking');
      Object.assign(b, patch);
      if (b.depositAmount > b.agreedAmount) throw new DemoServiceError('Deposit can’t be larger than the agreed amount.');
      return b;
    });
  },

  /* ---------------- Budget & money ---------------- */
  async addBudgetCategory(input) {
    await wait();
    return demoStore.update((db) => {
      const c = { id: createId('bc'), ...input, name: input.name.trim() };
      db.budgetCategories.push(c);
      log(db, input.eventId, 'budget', `Budget category “${c.name}” added (${formatNaira(c.planned)} planned)`, `/app/events/${input.eventId}/money`);
      return c;
    });
  },

  async updateBudgetCategory(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const c = find(db.budgetCategories, id, 'Category');
      Object.assign(c, patch);
      return c;
    });
  },

  async addBudgetItem(input) {
    await wait();
    return demoStore.update((db) => {
      const item = { id: createId('bi'), ...input, label: input.label.trim(), createdAt: nowIso() };
      db.budgetItems.push(item);
      log(db, input.eventId, 'budget', `${item.status === 'committed' ? 'Committed cost' : 'Estimate'} added: ${item.label} (${formatNaira(item.amount)})`, `/app/events/${input.eventId}/money`);
      return item;
    });
  },

  async updateBudgetItem(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const item = find(db.budgetItems, id, 'Budget item');
      Object.assign(item, patch);
      return item;
    });
  },

  async deleteBudgetItem(id) {
    await wait();
    demoStore.update((db) => {
      if (db.transactions.some((t) => t.budgetItemId === id && t.status !== 'failed')) {
        throw new DemoServiceError('This item has payments recorded against it and can’t be deleted.');
      }
      db.budgetItems = db.budgetItems.filter((i) => i.id !== id);
    });
  },

  async recordPayment(input) {
    await wait(500);
    return demoStore.update((db) => {
      if (input.amount <= 0) throw new DemoServiceError('Enter an amount greater than zero.');
      let counterparty = 'Expense';
      if (input.bookingId) {
        const b = find(db.bookings, input.bookingId, 'Booking');
        if (b.status !== 'confirmed') throw new DemoServiceError('Only confirmed bookings can receive payments.');
        const fin = bookingFinance(db, b);
        const room = b.agreedAmount - fin.paid - fin.pending;
        if (input.status !== 'failed' && input.amount > room) {
          throw new DemoServiceError(`That would overpay this booking. At most ${formatNaira(Math.max(0, room))} is unpaid and not already pending.`);
        }
        counterparty = db.vendors.find((v) => v.id === b.vendorId)?.name ?? 'Vendor';
      } else if (input.budgetItemId) {
        const item = find(db.budgetItems, input.budgetItemId, 'Budget item');
        counterparty = item.label;
        if (input.status !== 'failed') item.status = 'committed';
      } else {
        throw new DemoServiceError('Choose the booking or budget item this payment is for.');
      }
      const t = newTxn({
        eventId: input.eventId, direction: 'out', kind: input.bookingId ? 'vendor_payment' : 'expense_payment', amount: input.amount,
        status: input.status, counterparty, note: input.note, bookingId: input.bookingId, budgetItemId: input.budgetItemId
      });
      db.transactions.unshift(t);
      log(db, input.eventId, 'payment', `Payment of ${formatNaira(t.amount)} to ${counterparty} recorded as ${t.status} (simulated)`, `/app/events/${input.eventId}/money?txn=${t.id}`);
      return t;
    });
  },

  async recordContribution(input) {
    await wait(450);
    return demoStore.update((db) => {
      if (input.amount <= 0) throw new DemoServiceError('Enter an amount greater than zero.');
      const t = newTxn({
        eventId: input.eventId, direction: 'in', kind: input.giftItemId ? 'gift_contribution' : 'contribution', amount: input.amount,
        status: input.status, counterparty: input.contributorName.trim(), note: input.note, giftItemId: input.giftItemId
      });
      db.transactions.unshift(t);
      log(db, input.eventId, 'gift', `${t.counterparty} contributed ${formatNaira(t.amount)} (${t.status}, simulated)`, `/app/events/${input.eventId}/money?txn=${t.id}`);
      return t;
    });
  },

  async startPublicContribution(input) {
    await wait(300);
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      assertBookable(ev);
      if (input.amount < 100_00) throw new DemoServiceError('The minimum contribution is ₦100.');
      const t = newTxn({
        eventId: ev.id, direction: 'in', kind: input.giftItemId ? 'gift_contribution' : 'contribution', amount: input.amount,
        status: 'pending', counterparty: input.name.trim(), note: input.note, giftItemId: input.giftItemId
      });
      db.transactions.unshift(t);
      return t;
    });
  },

  async settleTransaction(id, outcome) {
    await wait(250);
    return demoStore.update((db) => {
      const t = find(db.transactions, id, 'Transaction');
      if (outcome === 'timeout') return t;
      if (t.status === 'success') return t; // idempotent: never re-settle a success
      t.status = outcome;
      t.updatedAt = nowIso();
      const label = t.direction === 'in' ? `${t.counterparty}’s ${formatNaira(t.amount)} contribution` : `Payment of ${formatNaira(t.amount)} to ${t.counterparty}`;
      log(db, t.eventId, t.direction === 'in' ? 'gift' : 'payment', `${label} ${outcome === 'success' ? 'confirmed' : 'failed'} (simulated)`, `/app/events/${t.eventId}/money?txn=${t.id}`, t.direction === 'in' ? t.counterparty : actor());
      return t;
    });
  },

  /* ---------------- Gifting ---------------- */
  async addGiftItem(input) {
    await wait();
    return demoStore.update((db) => {
      const g = { id: createId('gi'), ...input, name: input.name.trim(), status: 'available' as const, reservedBy: null, createdAt: nowIso() };
      db.giftItems.push(g);
      log(db, input.eventId, 'gift', `“${g.name}” added to the wishlist`, `/app/events/${input.eventId}/gifts`);
      return g;
    });
  },

  async updateGiftItem(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const g = find(db.giftItems, id, 'Gift');
      Object.assign(g, patch);
      return g;
    });
  },

  async deleteGiftItem(id) {
    await wait();
    demoStore.update((db) => {
      if (giftRaised(db, id).raised > 0 || db.transactions.some((t) => t.giftItemId === id && t.status === 'pending')) {
        throw new DemoServiceError('This gift has contributions and can’t be deleted.');
      }
      db.giftItems = db.giftItems.filter((g) => g.id !== id);
    });
  },

  async reserveGift(id, reservedBy) {
    await wait(500);
    return demoStore.update((db) => {
      const g = find(db.giftItems, id, 'Gift');
      if (g.kind !== 'physical') throw new DemoServiceError('Cash funds take contributions, not reservations.');
      if (g.status !== 'available') throw new DemoServiceError('Someone has already reserved this gift.');
      g.status = 'reserved';
      g.reservedBy = reservedBy.trim();
      log(db, g.eventId, 'gift', `${g.reservedBy} reserved “${g.name}”`, `/app/events/${g.eventId}/gifts`, g.reservedBy);
      return g;
    });
  },

  async releaseGift(id) {
    await wait();
    return demoStore.update((db) => {
      const g = find(db.giftItems, id, 'Gift');
      g.status = 'available';
      g.reservedBy = null;
      return g;
    });
  },

  async markGiftReceived(id) {
    await wait();
    return demoStore.update((db) => {
      const g = find(db.giftItems, id, 'Gift');
      if (g.kind !== 'physical') throw new DemoServiceError('Cash funds are tracked through confirmed contributions.');
      g.status = 'received';
      log(db, g.eventId, 'gift', `“${g.name}” marked as received by the organiser`, `/app/events/${g.eventId}/gifts`);
      return g;
    });
  },

  /* ---------------- Tickets ---------------- */
  async addTicketTier(input) {
    await wait();
    return demoStore.update((db) => {
      const ev = find(db.events, input.eventId, 'Event');
      const t = { id: createId('tt'), ...input, name: input.name.trim() };
      db.ticketTiers.push(t);
      ev.features.tickets = true;
      log(db, ev.id, 'ticket', `Ticket tier “${t.name}” created at ${formatNaira(t.price)}`, `/app/events/${ev.id}/tickets`);
      return t;
    });
  },

  async updateTicketTier(id, patch) {
    await wait();
    return demoStore.update((db) => {
      const t = find(db.ticketTiers, id, 'Ticket tier');
      const sold = tierStats(db, id).sold;
      if (patch.quantity !== undefined && patch.quantity < sold) throw new DemoServiceError(`Quantity can’t be below the ${sold} already sold.`);
      Object.assign(t, patch);
      return t;
    });
  },

  async createTicketOrder(input) {
    await wait(400);
    return demoStore.update((db) => {
      const existing = db.ticketOrders.find((o) => o.idempotencyKey === input.idempotencyKey);
      if (existing) return existing; // repeated clicks return the same order
      const ev = find(db.events, input.eventId, 'Event');
      assertBookable(ev);
      const tier = find(db.ticketTiers, input.tierId, 'Ticket tier');
      if (tier.status !== 'on_sale') throw new DemoServiceError('This ticket type is not on sale.');
      if (input.quantity < 1 || input.quantity > tier.maxPerOrder) throw new DemoServiceError(`Choose between 1 and ${tier.maxPerOrder} tickets.`);
      if (tierStats(db, tier.id).remaining < input.quantity) throw new DemoServiceError('Not enough tickets left for that quantity.');
      const order = {
        id: createId('to'), eventId: ev.id, tierId: tier.id, quantity: input.quantity, buyerName: input.buyerName.trim(),
        buyerEmail: input.buyerEmail.trim().toLowerCase(), total: tier.price * input.quantity, status: 'processing' as const,
        reference: createReference(), idempotencyKey: input.idempotencyKey, createdAt: nowIso()
      };
      db.ticketOrders.push(order);
      db.transactions.unshift(newTxn({ eventId: ev.id, direction: 'in', kind: 'ticket_sale', amount: order.total, status: 'pending', counterparty: order.buyerName, ticketOrderId: order.id, reference: order.reference }));
      return order;
    });
  },

  async settleTicketOrder(orderId, outcome) {
    await wait(250);
    return demoStore.update((db) => {
      const order = find(db.ticketOrders, orderId, 'Order');
      const txn = db.transactions.find((t) => t.ticketOrderId === orderId);
      const existingTickets = db.tickets.filter((t) => t.orderId === orderId);
      if (order.status === 'paid') return { order, tickets: existingTickets }; // idempotent
      if (outcome === 'timeout') {
        order.status = 'processing';
        if (txn) txn.status = 'pending';
        return { order, tickets: [] };
      }
      if (outcome === 'failed') {
        order.status = 'failed';
        if (txn) {txn.status = 'failed';txn.updatedAt = nowIso();}
        return { order, tickets: [] };
      }
      if (tierStats(db, order.tierId).remaining < order.quantity) {
        order.status = 'failed';
        if (txn) txn.status = 'failed';
        throw new DemoServiceError('Tickets sold out before payment completed. No charge was made.');
      }
      const tier = find(db.ticketTiers, order.tierId, 'Ticket tier');
      const newTickets: Ticket[] = Array.from({ length: order.quantity }, (_, i) => {
        let code = createTicketCode();
        while (db.tickets.some((t) => t.code === code)) code = createTicketCode();
        return { id: createId('tk'), orderId, eventId: order.eventId, tierId: order.tierId, code, holderName: i === 0 ? order.buyerName : `${order.buyerName} (guest ${i})`, status: 'valid', checkedInAt: null };
      });
      db.tickets.push(...newTickets);
      order.status = 'paid';
      if (txn) {txn.status = 'success';txn.updatedAt = nowIso();}
      log(db, order.eventId, 'ticket', `${order.buyerName} bought ${order.quantity} ${tier.name} ticket${order.quantity > 1 ? 's' : ''} (simulated)`, `/app/events/${order.eventId}/tickets`, order.buyerName);
      return { order, tickets: newTickets };
    });
  },

  async checkInTicket(eventId, rawCode) {
    await wait(350);
    return demoStore.update((db) => {
      const code = normaliseTicketCode(rawCode);
      const ticket = db.tickets.find((t) => t.code === code);
      const tierName = ticket ? db.ticketTiers.find((t) => t.id === ticket.tierId)?.name ?? null : null;
      if (!ticket) return { outcome: 'invalid' as const, code, ticket: null, tierName: null };
      if (ticket.eventId !== eventId) return { outcome: 'wrong_event' as const, code, ticket: { ...ticket }, tierName };
      if (ticket.status === 'cancelled') return { outcome: 'cancelled' as const, code, ticket: { ...ticket }, tierName };
      if (ticket.status === 'checked_in') return { outcome: 'already_checked_in' as const, code, ticket: { ...ticket }, tierName };
      ticket.status = 'checked_in';
      ticket.checkedInAt = nowIso();
      log(db, eventId, 'checkin', `${ticket.holderName} checked in (${tierName})`, `/check-in/${eventId}`);
      return { outcome: 'valid' as const, code, ticket: { ...ticket }, tierName };
    });
  },

  /* ---------------- Memories ---------------- */
  async addMemory(input) {
    await wait(300);
    return demoStore.update((db) => {
      const m = { id: createId('m'), ...input, uploadedBy: actor(), createdAt: nowIso() };
      db.memories.unshift(m);
      log(db, input.eventId, 'memory', `A photo was added to the gallery${input.localOnly ? ' (local preview)' : ''}`, `/app/events/${input.eventId}/memories`);
      return m;
    });
  },

  async removeMemory(id) {
    await wait(200);
    demoStore.update((db) => {
      const m = db.memories.find((x) => x.id === id);
      if (m?.localOnly) URL.revokeObjectURL(m.url);
      db.memories = db.memories.filter((x) => x.id !== id);
    });
  },

  async resetDemo() {
    await wait(600);
    demoStore.reset();
  }
};