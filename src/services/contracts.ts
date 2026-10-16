/**
 * JolliFlow frontend service contracts.
 *
 * UI components talk ONLY to these interfaces (via services/index.ts).
 * Today they are implemented by services/demo (localStorage + simulated payments).
 * The backend phase will provide an implementation in services/api with the same
 * method signatures, so pages and components do not need to be rewritten.
 *
 * All amounts are integer kobo. All dates are ISO strings.
 */
import type {
  Announcement,
  Booking,
  BookingStatus,
  BudgetCategory,
  BudgetItem,
  BudgetItemStatus,
  CheckInResult,
  Collaborator,
  CollaboratorRole,
  EventFeatures,
  EventRecord,
  EventStatus,
  EventType,
  GiftItem,
  GiftKind,
  Guest,
  ID,
  InvitationStatus,
  Kobo,
  Memory,
  PaymentStatus,
  RsvpStatus,
  Task,
  TaskPriority,
  TaskStatus,
  Ticket,
  TicketOrder,
  TicketTier,
  TierStatus,
  Transaction,
  UserProfile,
  Vendor,
  VendorCategory,
  Visibility } from
'../types/domain';

/* ---------- Inputs ---------- */
export interface CreateEventInput {
  title: string;
  type: EventType;
  description: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  city: string;
  address: string;
  coverUrl: string;
  visibility: Visibility;
  rsvpEnabled: boolean;
  capacity: number | null;
  plusOnesAllowed: boolean;
  budgetTotal: Kobo;
  categories: Array<{name: string;planned: Kobo;}>;
  collaborators: Array<{name: string;email: string;role: CollaboratorRole;}>;
  features: EventFeatures;
  ticketTier: {name: string;price: Kobo;quantity: number;} | null;
  publish: boolean;
}

export type EventPatch = Partial<Omit<EventRecord, 'id' | 'createdAt' | 'managed' | 'isSample' | 'slug'>>;

export interface TaskInput {
  eventId: ID;
  title: string;
  details: string;
  priority: TaskPriority;
  assigneeId: ID | null;
  dueDate: string | null;
  category: string;
  status?: TaskStatus;
}

export interface GuestInput {
  eventId: ID;
  name: string;
  contact: string;
  group: string;
  plusOnes: number;
  rsvp: RsvpStatus;
  note: string;
}

export interface RsvpInput {
  eventId: ID;
  guestId?: ID | null;
  name: string;
  contact: string;
  rsvp: Exclude<RsvpStatus, 'pending'>;
  plusOnes: number;
  note: string;
}

export interface ManualVendorInput {
  name: string;
  category: VendorCategory;
  contact: string;
  city: string;
  description: string;
}

export interface BookingInput {
  eventId: ID;
  vendorId: ID;
  categoryId: ID | null;
  serviceName: string;
  agreedAmount: Kobo;
  depositAmount: Kobo;
  depositDueDate: string | null;
  balanceDueDate: string | null;
  notes: string;
  status: Extract<BookingStatus, 'requested' | 'confirmed'>;
}

export interface BudgetItemInput {
  eventId: ID;
  categoryId: ID;
  label: string;
  amount: Kobo;
  status: BudgetItemStatus;
  note: string;
}

export interface PaymentRecordInput {
  eventId: ID;
  bookingId: ID | null;
  budgetItemId: ID | null;
  amount: Kobo;
  status: PaymentStatus;
  note: string;
}

export interface ContributionInput {
  eventId: ID;
  giftItemId: ID | null;
  contributorName: string;
  amount: Kobo;
  note: string;
  status: Extract<PaymentStatus, 'pending' | 'success'>;
}

export interface GiftItemInput {
  eventId: ID;
  name: string;
  description: string;
  kind: GiftKind;
  targetAmount: Kobo | null;
  priceHint: Kobo | null;
}

export interface TicketTierInput {
  eventId: ID;
  name: string;
  description: string;
  price: Kobo;
  quantity: number;
  maxPerOrder: number;
  status: TierStatus;
}

export interface TicketOrderInput {
  eventId: ID;
  tierId: ID;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  idempotencyKey: string;
}

/** 'timeout' means the provider has not confirmed yet — the record stays pending. */
export type SettlementOutcome = 'success' | 'failed' | 'timeout';

/* ---------- Service ---------- */
export interface JolliFlowService {
  // Events
  createEvent(input: CreateEventInput): Promise<EventRecord>;
  updateEvent(id: ID, patch: EventPatch): Promise<EventRecord>;
  setEventStatus(id: ID, status: EventStatus): Promise<EventRecord>;
  deleteEvent(id: ID): Promise<void>;

  // Collaboration
  inviteCollaborator(eventId: ID, input: {name: string;email: string;role: CollaboratorRole;phone?: string;}): Promise<Collaborator>;
  removeCollaborator(id: ID): Promise<void>;
  postAnnouncement(input: {eventId: ID;title: string;body: string;isPublic: boolean;}): Promise<Announcement>;
  deleteAnnouncement(id: ID): Promise<void>;

  // Tasks
  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: ID, patch: Partial<TaskInput>): Promise<Task>;
  setTaskStatus(id: ID, status: TaskStatus): Promise<Task>;
  deleteTask(id: ID): Promise<void>;

  // Guests & RSVP
  addGuest(input: GuestInput): Promise<Guest>;
  updateGuest(id: ID, patch: Partial<GuestInput>): Promise<Guest>;
  deleteGuest(id: ID): Promise<void>;
  setInvitationStatus(ids: ID[], status: InvitationStatus): Promise<void>;
  submitRsvp(input: RsvpInput): Promise<{guest: Guest;wasUpdate: boolean;}>;

  // Vendors & bookings
  addManualVendor(input: ManualVendorInput): Promise<Vendor>;
  requestBooking(input: BookingInput): Promise<Booking>;
  setBookingStatus(id: ID, status: BookingStatus): Promise<Booking>;
  updateBooking(id: ID, patch: Partial<BookingInput>): Promise<Booking>;

  // Budget & money
  addBudgetCategory(input: {eventId: ID;name: string;planned: Kobo;}): Promise<BudgetCategory>;
  updateBudgetCategory(id: ID, patch: {name?: string;planned?: Kobo;}): Promise<BudgetCategory>;
  addBudgetItem(input: BudgetItemInput): Promise<BudgetItem>;
  updateBudgetItem(id: ID, patch: Partial<BudgetItemInput>): Promise<BudgetItem>;
  deleteBudgetItem(id: ID): Promise<void>;
  recordPayment(input: PaymentRecordInput): Promise<Transaction>;
  recordContribution(input: ContributionInput): Promise<Transaction>;
  startPublicContribution(input: {eventId: ID;giftItemId: ID | null;name: string;amount: Kobo;note: string;}): Promise<Transaction>;
  settleTransaction(id: ID, outcome: SettlementOutcome): Promise<Transaction>;

  // Gifting
  addGiftItem(input: GiftItemInput): Promise<GiftItem>;
  updateGiftItem(id: ID, patch: Partial<GiftItemInput>): Promise<GiftItem>;
  deleteGiftItem(id: ID): Promise<void>;
  reserveGift(id: ID, reservedBy: string): Promise<GiftItem>;
  releaseGift(id: ID): Promise<GiftItem>;
  markGiftReceived(id: ID): Promise<GiftItem>;

  // Tickets
  addTicketTier(input: TicketTierInput): Promise<TicketTier>;
  updateTicketTier(id: ID, patch: Partial<TicketTierInput>): Promise<TicketTier>;
  createTicketOrder(input: TicketOrderInput): Promise<TicketOrder>;
  settleTicketOrder(orderId: ID, outcome: SettlementOutcome): Promise<{order: TicketOrder;tickets: Ticket[];}>;
  checkInTicket(eventId: ID, code: string): Promise<CheckInResult>;

  // Memories
  addMemory(input: {eventId: ID;url: string;caption: string;localOnly: boolean;}): Promise<Memory>;
  removeMemory(id: ID): Promise<void>;

  // Demo utilities
  resetDemo(): Promise<void>;
}

/* ---------- Payments (provider-neutral) ---------- */
export interface PaymentRequest {
  reference: string;
  amount: Kobo;
  description: string;
  payerName: string;
  /** Demo only: which outcome to simulate. Ignored by real providers. */
  simulate?: SettlementOutcome;
}

export interface PaymentResult {
  reference: string;
  status: SettlementOutcome;
  message: string;
  /** Real providers will return false; the backend must verify via webhook before marking success. */
  simulated: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  initiate(request: PaymentRequest): Promise<PaymentResult>;
}

/* ---------- Auth (prototype) ---------- */
export interface AuthService {
  getSession(): UserProfile | null;
  signIn(email: string, password: string): Promise<UserProfile>;
  signUp(input: {name: string;email: string;password: string;}): Promise<UserProfile>;
  enterDemo(): Promise<UserProfile>;
  requestPasswordReset(email: string): Promise<void>;
  updateProfile(patch: Partial<UserProfile>): Promise<UserProfile>;
  signOut(): Promise<void>;
}