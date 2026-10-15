import type { ID, ISODateTime, Kobo } from './domain';

export type InsightSeverity = 'critical' | 'warning' | 'info';

export type InsightKind =
'deposit_due' |
'balance_due' |
'overdue_task' |
'booking_unconfirmed' |
'event_tasks' |
'rsvp_low' |
'over_budget' |
'payment_failed';

/**
 * A rule-based operational insight. These are deterministic rules,
 * not AI predictions. Every insight links to the record that explains it.
 */
export interface Insight {
  id: string;
  eventId: ID;
  eventTitle: string;
  kind: InsightKind;
  severity: InsightSeverity;
  title: string;
  detail: string;
  /** Plain-language description of the rule that produced this insight */
  rule: string;
  link: string;
  amount?: Kobo;
  dueDate?: ISODateTime;
  owner?: string;
}