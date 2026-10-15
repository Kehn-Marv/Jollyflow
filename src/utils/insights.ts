import type { DemoDatabase, ID } from '../types/domain';
import type { Insight, InsightSeverity } from '../types/insights';
import { bookingFinance, summariseEvent } from './finance';
import { daysUntil, dueLabel, isPast } from './dates';
import { formatNaira } from './money';
import { rsvpSummary } from './rsvp';

const SEVERITY_ORDER: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2 };

/**
 * Event Operations Intelligence — deterministic, rule-based checks.
 * Not AI. Each insight carries the rule that produced it and a link to the record.
 */
export function computeInsights(db: DemoDatabase, now: Date = new Date(), onlyEventId?: ID): Insight[] {
  const out: Insight[] = [];
  const events = db.events.filter(
    (e) => e.managed && (e.status === 'published' || e.status === 'draft') && !isPast(e.endsAt, now) && (!onlyEventId || e.id === onlyEventId)
  );

  for (const ev of events) {
    const base = `/app/events/${ev.id}`;
    const daysToEvent = daysUntil(ev.startsAt, now);
    const collabName = (id: ID | null) => db.collaborators.find((c) => c.id === id)?.name;

    // Vendor deposits & balances
    for (const b of db.bookings.filter((x) => x.eventId === ev.id)) {
      const vendor = db.vendors.find((v) => v.id === b.vendorId);
      const fin = bookingFinance(db, b);
      if (b.status === 'confirmed' && b.depositDueDate && fin.depositOutstanding > 0) {
        const d = daysUntil(b.depositDueDate, now);
        if (d <= 3) {
          const pendingNote = fin.pending > 0 ? ` ${formatNaira(fin.pending)} is pending confirmation and is not counted as paid.` : '';
          out.push({
            id: `dep_${b.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'deposit_due',
            severity: d <= 1 ? 'critical' : 'warning',
            title: `${vendor?.name ?? 'Vendor'} deposit ${d < 0 ? 'overdue' : 'due ' + dueLabel(b.depositDueDate, now)}`,
            detail: `${formatNaira(fin.depositOutstanding)} of a ${formatNaira(b.depositAmount)} deposit is unpaid.${pendingNote}`,
            rule: 'Confirmed booking with an unpaid deposit due within 3 days.',
            link: `${base}/vendors?booking=${b.id}`, amount: fin.depositOutstanding, dueDate: b.depositDueDate
          });
        }
      } else if (b.status === 'confirmed' && b.balanceDueDate && fin.outstanding > 0) {
        const d = daysUntil(b.balanceDueDate, now);
        if (d <= 7) {
          out.push({
            id: `bal_${b.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'balance_due',
            severity: d <= 2 ? 'critical' : 'warning',
            title: `${vendor?.name ?? 'Vendor'} balance ${d < 0 ? 'overdue' : 'due ' + dueLabel(b.balanceDueDate, now)}`,
            detail: `${formatNaira(fin.outstanding)} outstanding on ${b.serviceName}.`,
            rule: 'Confirmed booking with an outstanding balance due within 7 days.',
            link: `${base}/vendors?booking=${b.id}`, amount: fin.outstanding, dueDate: b.balanceDueDate
          });
        }
      }
      if (b.status === 'requested' && (daysToEvent <= 30 || daysUntil(b.createdAt, now) <= -3)) {
        out.push({
          id: `req_${b.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'booking_unconfirmed', severity: 'info',
          title: `${vendor?.name ?? 'Vendor'} hasn’t confirmed yet`,
          detail: `${b.serviceName} · requested ${dueLabel(b.createdAt, now)}. Not counted in committed spend until confirmed.`,
          rule: 'Booking still awaiting confirmation within 30 days of the event, or after 3 days.',
          link: `${base}/vendors?booking=${b.id}`
        });
      }
    }

    // Failed outgoing payments
    for (const t of db.transactions.filter((x) => x.eventId === ev.id && x.direction === 'out' && x.status === 'failed')) {
      out.push({
        id: `fail_${t.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'payment_failed', severity: 'warning',
        title: `Payment to ${t.counterparty} failed`,
        detail: `${formatNaira(t.amount)} did not go through (simulated). Nothing was deducted — retry or record a new payment.`,
        rule: 'Outgoing payment with a failed status.',
        link: `${base}/money?txn=${t.id}`, amount: t.amount
      });
    }

    // Overdue tasks
    const openTasks = db.tasks.filter((t) => t.eventId === ev.id && t.status !== 'done');
    for (const t of openTasks.filter((x) => x.dueDate && isPast(x.dueDate, now))) {
      out.push({
        id: `task_${t.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'overdue_task',
        severity: t.priority === 'high' ? 'critical' : 'warning',
        title: `Overdue: ${t.title}`,
        detail: `Was due ${dueLabel(t.dueDate as string, now)}${collabName(t.assigneeId) ? ` · ${collabName(t.assigneeId)}` : ' · unassigned'}.`,
        rule: 'Task not completed after its due date.',
        link: `${base}/plan?task=${t.id}`, dueDate: t.dueDate as string, owner: collabName(t.assigneeId)
      });
    }

    if (daysToEvent >= 0 && daysToEvent <= 14 && openTasks.length >= 3) {
      out.push({
        id: `tasks_${ev.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'event_tasks', severity: 'warning',
        title: `${openTasks.length} open tasks, ${daysToEvent} days to go`,
        detail: 'The event is close and several tasks are still open.',
        rule: 'Event within 14 days with 3 or more open tasks.',
        link: `${base}/plan?filter=open`
      });
    }

    // RSVP health
    if (ev.features.guests && daysToEvent >= 0 && daysToEvent <= 30) {
      const s = rsvpSummary(db.guests.filter((g) => g.eventId === ev.id));
      if (s.total >= 5 && s.pending / s.total > 0.3) {
        out.push({
          id: `rsvp_${ev.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'rsvp_low', severity: 'warning',
          title: `${s.pending} of ${s.total} guests haven’t responded`,
          detail: `Only ${Math.round(s.responseRate)}% have replied with ${daysToEvent} days to go. Follow up before final headcounts.`,
          rule: 'More than 30% of guests still pending within 30 days of the event.',
          link: `${base}/guests?filter=pending`
        });
      }
    }

    // Budget
    const fin = summariseEvent(db, ev.id);
    if (fin.overCommitted) {
      out.push({
        id: `over_${ev.id}`, eventId: ev.id, eventTitle: ev.title, kind: 'over_budget', severity: 'critical',
        title: `Commitments exceed budget by ${formatNaira(fin.committed - fin.budget)}`,
        detail: 'Confirmed bookings and committed items are higher than the total budget.',
        rule: 'Committed spend greater than total budget.',
        link: `${base}/money`, amount: fin.committed - fin.budget
      });
    }
  }

  return out.sort((a, b) => {
    const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (s !== 0) return s;
    return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
  });
}