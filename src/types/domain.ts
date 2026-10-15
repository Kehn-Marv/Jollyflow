/**
 * JolliFlow shared domain contracts.
 *
 * These types are the agreement between the frontend and the future backend.
 * The demo service (services/demo) and the future API adapter (services/api)
 * must both return exactly these shapes.
 *
 * Money: every amount is an integer number of KOBO (₦1 = 100 kobo).
 * Never use floating point naira values as the source of truth.
 */

export type ID = string;
/** Integer kobo. ₦1 = 100 kobo. */
export type Kobo = number;
/** ISO-8601 timestamp string (UTC). Display in Africa/Lagos. */
export type ISODateTime = string;

/* ---------- Events ---------- */
export type EventType =
'birthday' |
'wedding' |
'traditional_wedding' |
'anniversary' |
'party' |
'naming' |
'graduation' |
'corporate' |
'concert' |
'community' |
'custom';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'archived';
/** public = listed on /explore. private = only reachable through an invitation link. */
export type Visibility = 'public' | 'private';

export interface EventFeatures {
  guests: boolean;
  vendors: boolean;
  tickets: boolean;
  gifting: boolean;
  memories: boolean;
}

export interface EventRecord {
  id: ID;
  slug: string;
  title: string;
  type: EventType;
  description: string;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  timezone: string;
  venue: string;
  city: string;
  address: string;
  coverUrl: string;
  status: EventStatus;
  visibility: Visibility;
  rsvpEnabled: boolean;
  capacity: number | null;
  plusOnesAllowed: boolean;
  budgetTotal: Kobo;
  features: EventFeatures;
  organiserName: string;
  /** true when the signed-in planner manages this event */
  managed: boolean;
  isSample: boolean;
  createdAt: ISODateTime;
}

/* ---------- Collaboration ---------- */
export type CollaboratorRole = 'owner' | 'planner' | 'co_host' | 'finance' | 'vendor_manager' | 'viewer';

export interface Collaborator {
  id: ID;
  eventId: ID;
  name: string;
  email: string;
  role: CollaboratorRole;
  status: 'active' | 'invited';
  isYou: boolean;
}

/* ---------- Tasks ---------- */
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: ID;
  eventId: ID;
  title: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: ID | null;
  dueDate: ISODateTime | null;
  category: string;
  createdAt: ISODateTime;
  completedAt: ISODateTime | null;
}

/* ---------- Guests ---------- */
export type RsvpStatus = 'pending' | 'attending' | 'declined';
/** Delivery is simulated in the frontend phase — nothing is actually sent. */
export type InvitationStatus = 'not_sent' | 'link_copied' | 'simulated_sent';

export interface Guest {
  id: ID;
  eventId: ID;
  name: string;
  contact: string;
  group: string;
  rsvp: RsvpStatus;
  invitation: InvitationStatus;
  plusOnes: number;
  note: string;
  respondedAt: ISODateTime | null;
  source: 'organiser' | 'public_rsvp';
  createdAt: ISODateTime;
}

/* ---------- Vendors & bookings ---------- */
export type VendorCategory =
'catering' |
'decor' |
'photography' |
'venue' |
'audiovisual' |
'cake' |
'beauty' |
'entertainment' |
'rentals';

export interface ServiceOffering {
  id: ID;
  name: string;
  description: string;
  price: Kobo;
  unit: string;
}

/** A vendor profile is independent of any event. */
export interface Vendor {
  id: ID;
  name: string;
  category: VendorCategory;
  tagline: string;
  description: string;
  city: string;
  serviceAreas: string[];
  priceFrom: Kobo;
  priceTo: Kobo;
  portfolio: string[];
  services: ServiceOffering[];
  contact: string;
  responseTime: string;
  /** false = recorded manually by an organiser, not listed on the marketplace */
  isMarketplace: boolean;
  isSample: boolean;
  createdAt: ISODateTime;
}

export type BookingStatus = 'requested' | 'confirmed' | 'declined' | 'cancelled';

/** An event-specific commitment with a vendor. */
export interface Booking {
  id: ID;
  eventId: ID;
  vendorId: ID;
  categoryId: ID | null;
  serviceName: string;
  status: BookingStatus;
  agreedAmount: Kobo;
  depositAmount: Kobo;
  depositDueDate: ISODateTime | null;
  balanceDueDate: ISODateTime | null;
  notes: string;
  createdAt: ISODateTime;
}

/* ---------- Budget & money ---------- */
export interface BudgetCategory {
  id: ID;
  eventId: ID;
  name: string;
  planned: Kobo;
}

/** estimate = planned cost only. committed = agreed / owed. */
export type BudgetItemStatus = 'estimate' | 'committed';

export interface BudgetItem {
  id: ID;
  eventId: ID;
  categoryId: ID;
  label: string;
  amount: Kobo;
  status: BudgetItemStatus;
  note: string;
  createdAt: ISODateTime;
}

export type TransactionDirection = 'in' | 'out';
export type TransactionKind = 'vendor_payment' | 'expense_payment' | 'contribution' | 'gift_contribution' | 'ticket_sale';
/** Only 'success' counts as money moved. Pending and failed never count as paid/received. */
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: ID;
  eventId: ID;
  direction: TransactionDirection;
  kind: TransactionKind;
  amount: Kobo;
  status: PaymentStatus;
  reference: string;
  counterparty: string;
  note: string;
  bookingId: ID | null;
  budgetItemId: ID | null;
  giftItemId: ID | null;
  ticketOrderId: ID | null;
  /** Always true in the frontend phase. The backend will set this from the payment provider. */
  simulated: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ---------- Gifting ---------- */
export type GiftKind = 'physical' | 'cash_fund';
/** reserved = a guest has said they will bring it. received = organiser confirmed receipt. */
export type GiftStatus = 'available' | 'reserved' | 'received';

export interface GiftItem {
  id: ID;
  eventId: ID;
  name: string;
  description: string;
  kind: GiftKind;
  targetAmount: Kobo | null;
  priceHint: Kobo | null;
  status: GiftStatus;
  reservedBy: string | null;
  createdAt: ISODateTime;
}

/* ---------- Tickets ---------- */
export type TierStatus = 'on_sale' | 'paused' | 'cancelled';

export interface TicketTier {
  id: ID;
  eventId: ID;
  name: string;
  description: string;
  price: Kobo;
  quantity: number;
  maxPerOrder: number;
  status: TierStatus;
}

export type OrderStatus = 'processing' | 'paid' | 'failed';

export interface TicketOrder {
  id: ID;
  eventId: ID;
  tierId: ID;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  total: Kobo;
  status: OrderStatus;
  reference: string;
  /** Prevents duplicate orders from repeated clicks / retries */
  idempotencyKey: string;
  createdAt: ISODateTime;
}

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled';

export interface Ticket {
  id: ID;
  orderId: ID;
  eventId: ID;
  tierId: ID;
  code: string;
  holderName: string;
  status: TicketStatus;
  checkedInAt: ISODateTime | null;
}

export type CheckInOutcome = 'valid' | 'already_checked_in' | 'invalid' | 'cancelled' | 'wrong_event';

export interface CheckInResult {
  outcome: CheckInOutcome;
  code: string;
  ticket: Ticket | null;
  tierName: string | null;
}

/* ---------- Memories, activity, updates ---------- */
export interface Memory {
  id: ID;
  eventId: ID;
  url: string;
  caption: string;
  uploadedBy: string;
  createdAt: ISODateTime;
  /** true = browser object URL preview that disappears on refresh */
  localOnly: boolean;
}

export type ActivityKind =
'rsvp' |
'booking' |
'task' |
'payment' |
'guest' |
'gift' |
'ticket' |
'checkin' |
'announcement' |
'event' |
'collaborator' |
'memory' |
'budget';

export interface Activity {
  id: ID;
  eventId: ID;
  kind: ActivityKind;
  message: string;
  actor: string;
  createdAt: ISODateTime;
  link: string | null;
}

export interface Announcement {
  id: ID;
  eventId: ID;
  title: string;
  body: string;
  isPublic: boolean;
  author: string;
  createdAt: ISODateTime;
}

/* ---------- Users ---------- */
export type UserRole = 'planner' | 'host' | 'guest' | 'vendor' | 'contributor';

export interface NotificationPrefs {
  deadlines: boolean;
  payments: boolean;
  rsvps: boolean;
  weeklyDigest: boolean;
}

export interface UserProfile {
  id: ID;
  name: string;
  email: string;
  businessName: string;
  city: string;
  roles: UserRole[];
  primaryNeed: string;
  onboarded: boolean;
  isDemo: boolean;
  notificationPrefs: NotificationPrefs;
  createdAt: ISODateTime;
}

/* ---------- Demo database shape ---------- */
export interface DemoDatabase {
  version: number;
  seededAt: ISODateTime;
  events: EventRecord[];
  collaborators: Collaborator[];
  tasks: Task[];
  guests: Guest[];
  vendors: Vendor[];
  bookings: Booking[];
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  transactions: Transaction[];
  giftItems: GiftItem[];
  ticketTiers: TicketTier[];
  ticketOrders: TicketOrder[];
  tickets: Ticket[];
  memories: Memory[];
  activities: Activity[];
  announcements: Announcement[];
}