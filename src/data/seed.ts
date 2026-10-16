import type {
  Activity,
  Announcement,
  Booking,
  BudgetCategory,
  BudgetItem,
  Collaborator,
  DemoDatabase,
  EventRecord,
  GiftItem,
  Guest,
  InvitationStatus,
  Memory,
  RsvpStatus,
  Task,
  TaskPriority,
  TaskStatus,
  Ticket,
  TicketOrder,
  TicketTier,
  Transaction,
  Vendor } from
'../types/domain';
import { images } from './images';
import { naira } from '../utils/money';

export const DB_VERSION = 3;

/**
 * Builds the sample universe relative to `now`, so the demo never looks stale.
 * All IDs, references and ticket codes are stable to keep demos and screenshots consistent.
 * Every business, person and testimonial here is fictional sample content.
 */
export function buildSeed(now: Date = new Date()): DemoDatabase {
  const at = (days: number, hour = 10, minute = 0): string =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour, minute, 0, 0).toISOString();

  /* ---------------- Events ---------------- */
  const events: EventRecord[] = [
  {
    id: 'e_wedding', slug: 'adaeze-and-tunde', title: 'Adaeze & Tunde’s Wedding', type: 'wedding',
    description: 'An evening reception celebrating Adaeze Okafor and Tunde Bakare with family, friends, live highlife and plenty of jollof. Colours of the day: coral and gold.',
    startsAt: at(24, 16), endsAt: at(24, 23), timezone: 'Africa/Lagos',
    venue: 'Lagoon View Hall', city: 'Lagos', address: '14 Ozumba Mbadiwe Avenue, Victoria Island',
    coverUrl: images.wedding, status: 'published', visibility: 'private', rsvpEnabled: true, capacity: 600, plusOnesAllowed: true,
    budgetTotal: naira(18_500_000), features: { guests: true, vendors: true, tickets: false, gifting: true, memories: true },
    organiserName: 'Ada Okafor Events', managed: true, isSample: true, createdAt: at(-75)
  },
  {
    id: 'e_birthday', slug: 'kemi-turns-30', title: 'Kemi Turns 30: Rooftop Dinner', type: 'birthday',
    description: 'Dinner under the Abuja sky for Kemi’s 30th. Dress code: all white with one bold accessory.',
    startsAt: at(9, 19), endsAt: at(9, 23, 30), timezone: 'Africa/Lagos',
    venue: 'Skyline Rooftop', city: 'Abuja', address: '27 Adetokunbo Ademola Crescent, Wuse II',
    coverUrl: images.birthday, status: 'published', visibility: 'public', rsvpEnabled: true, capacity: 40, plusOnesAllowed: false,
    budgetTotal: naira(2_400_000), features: { guests: true, vendors: true, tickets: false, gifting: true, memories: true },
    organiserName: 'Kemi Adebayo with Ada Okafor Events', managed: true, isSample: true, createdAt: at(-28)
  },
  {
    id: 'e_concert', slug: 'lagos-sound-nights-4', title: 'Lagos Sound Nights Vol. 4', type: 'concert',
    description: 'An open-air night of Afrobeats, alté and live percussion. Four acts, one stage, gates open at 6pm.',
    startsAt: at(17, 18), endsAt: at(17, 23, 30), timezone: 'Africa/Lagos',
    venue: 'Marina Open Grounds', city: 'Lagos', address: 'Marina Road, Lagos Island',
    coverUrl: images.concert, status: 'published', visibility: 'public', rsvpEnabled: false, capacity: 492, plusOnesAllowed: false,
    budgetTotal: naira(12_000_000), features: { guests: false, vendors: true, tickets: true, gifting: false, memories: true },
    organiserName: 'Ada Okafor Events', managed: true, isSample: true, createdAt: at(-50)
  },
  {
    id: 'e_naming', slug: 'chiamaka-naming', title: 'Baby Chiamaka’s Naming Ceremony', type: 'naming',
    description: 'Family and friends gathered to welcome and name our daughter. Thank you for celebrating with us.',
    startsAt: at(-12, 11), endsAt: at(-12, 16), timezone: 'Africa/Lagos',
    venue: 'Okafor Family Residence', city: 'Enugu', address: 'Independence Layout, Enugu',
    coverUrl: images.naming, status: 'published', visibility: 'private', rsvpEnabled: true, capacity: 120, plusOnesAllowed: true,
    budgetTotal: naira(1_200_000), features: { guests: true, vendors: true, tickets: false, gifting: true, memories: true },
    organiserName: 'The Okafor Family', managed: true, isSample: true, createdAt: at(-45)
  },
  {
    id: 'e_mixer', slug: 'founders-mixer-abuja', title: 'Founders & Finance Mixer', type: 'corporate',
    description: 'An evening of conversations between early-stage founders and finance leaders. Free entry, registration required.',
    startsAt: at(40, 17), endsAt: at(40, 21), timezone: 'Africa/Lagos',
    venue: 'The Glasshouse', city: 'Abuja', address: 'Plot 88, Jabi Lake Road',
    coverUrl: images.corporate, status: 'published', visibility: 'public', rsvpEnabled: true, capacity: 150, plusOnesAllowed: false,
    budgetTotal: naira(3_500_000), features: { guests: true, vendors: true, tickets: false, gifting: false, memories: false },
    organiserName: 'Ada Okafor Events', managed: true, isSample: true, createdAt: at(-10)
  },
  {
    id: 'e_grad', slug: 'ifeoma-graduation', title: 'Ifeoma’s Graduation Party', type: 'graduation',
    description: 'Celebrating Ifeoma’s first-class degree with a garden lunch.',
    startsAt: at(55, 14), endsAt: at(55, 19), timezone: 'Africa/Lagos',
    venue: 'GRA Garden', city: 'Port Harcourt', address: 'GRA Phase 2, Port Harcourt',
    coverUrl: images.memories, status: 'draft', visibility: 'private', rsvpEnabled: true, capacity: 80, plusOnesAllowed: true,
    budgetTotal: naira(900_000), features: { guests: true, vendors: false, tickets: false, gifting: true, memories: false },
    organiserName: 'Ada Okafor Events', managed: true, isSample: true, createdAt: at(-3)
  },
  {
    id: 'e_owambe', slug: 'owambe-under-the-stars', title: 'Owambe Under the Stars', type: 'party',
    description: 'A citywide owambe with live fuji, a DJ set and aso-ebi optional. Bring your dancing shoes.',
    startsAt: at(21, 20), endsAt: at(22, 2), timezone: 'Africa/Lagos',
    venue: 'Ikoyi Club Gardens', city: 'Lagos', address: 'Ikoyi, Lagos',
    coverUrl: images.hero, status: 'published', visibility: 'public', rsvpEnabled: false, capacity: 300, plusOnesAllowed: false,
    budgetTotal: 0, features: { guests: false, vendors: false, tickets: true, gifting: false, memories: false },
    organiserName: 'Owambe Collective (sample)', managed: false, isSample: true, createdAt: at(-20)
  },
  {
    id: 'e_artfair', slug: 'coal-city-art-fair', title: 'Coal City Art & Book Fair', type: 'community',
    description: 'Local painters, poets and publishers in one courtyard. Free to attend, RSVP so we can plan seating.',
    startsAt: at(30, 10), endsAt: at(30, 18), timezone: 'Africa/Lagos',
    venue: 'Independence Courtyard', city: 'Enugu', address: 'Okpara Avenue, Enugu',
    coverUrl: images.decor, status: 'published', visibility: 'public', rsvpEnabled: true, capacity: 250, plusOnesAllowed: true,
    budgetTotal: 0, features: { guests: true, vendors: false, tickets: false, gifting: false, memories: false },
    organiserName: 'Coal City Creatives (sample)', managed: false, isSample: true, createdAt: at(-14)
  },
  {
    id: 'e_jollof', slug: 'lagos-jollof-festival', title: 'Lagos Jollof Festival', type: 'community',
    description: 'Twelve kitchens, one question: whose jollof wins? This event has already taken place.',
    startsAt: at(-5, 12), endsAt: at(-5, 20), timezone: 'Africa/Lagos',
    venue: 'Muri Okunola Park', city: 'Lagos', address: 'Victoria Island, Lagos',
    coverUrl: images.catering, status: 'published', visibility: 'public', rsvpEnabled: false, capacity: 800, plusOnesAllowed: false,
    budgetTotal: 0, features: { guests: false, vendors: false, tickets: true, gifting: false, memories: false },
    organiserName: 'Naija Food Lovers (sample)', managed: false, isSample: true, createdAt: at(-40)
  }];


  /* ---------------- Collaborators ---------------- */
  const collaborators: Collaborator[] = [
  { id: 'c_w_you', eventId: 'e_wedding', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'owner', status: 'active', isYou: true, phone: '+234 803 412 7765' },
  { id: 'c_w_tunde', eventId: 'e_wedding', name: 'Tunde Bakare', email: 'tunde@example.com', role: 'co_host', status: 'active', isYou: false, phone: '+234 806 220 1934' },
  { id: 'c_w_ngozi', eventId: 'e_wedding', name: 'Ngozi Eze', email: 'ngozi@example.com', role: 'finance', status: 'active', isYou: false, phone: '+234 809 551 0287' },
  { id: 'c_w_bayo', eventId: 'e_wedding', name: 'Bayo Adeyemi', email: 'bayo@example.com', role: 'vendor_manager', status: 'invited', isYou: false, phone: '+234 812 774 3016' },
  { id: 'c_b_you', eventId: 'e_birthday', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'planner', status: 'active', isYou: true, phone: '+234 803 412 7765' },
  { id: 'c_b_kemi', eventId: 'e_birthday', name: 'Kemi Adebayo', email: 'kemi@example.com', role: 'owner', status: 'active', isYou: false, phone: '+234 802 918 4450' },
  { id: 'c_c_you', eventId: 'e_concert', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'owner', status: 'active', isYou: true, phone: '+234 803 412 7765' },
  { id: 'c_c_segun', eventId: 'e_concert', name: 'Segun Ola', email: 'segun@example.com', role: 'planner', status: 'active', isYou: false, phone: '+234 705 336 1208' },
  { id: 'c_c_halima', eventId: 'e_concert', name: 'Halima Musa', email: 'halima@example.com', role: 'vendor_manager', status: 'active', isYou: false, phone: '+234 816 042 7791' },
  { id: 'c_n_you', eventId: 'e_naming', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'planner', status: 'active', isYou: true, phone: '+234 803 412 7765' },
  { id: 'c_m_you', eventId: 'e_mixer', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'owner', status: 'active', isYou: true, phone: '+234 803 412 7765' },
  { id: 'c_g_you', eventId: 'e_grad', name: 'Ada Okafor', email: 'ada@demo.jolliflow.ng', role: 'owner', status: 'active', isYou: true, phone: '+234 803 412 7765' }];


  /* ---------------- Tasks ---------------- */
  type TaskRow = [string, string, string, TaskStatus, TaskPriority, string | null, number | null, string];
  const taskRows: TaskRow[] = [
  ['t_w1', 'e_wedding', 'Pay Bloomhaus decor deposit', 'in_progress', 'high', 'c_w_ngozi', 1, 'Vendors'],
  ['t_w2', 'e_wedding', 'Send invitations to Tunde’s family list', 'todo', 'high', 'c_w_tunde', -2, 'Guests'],
  ['t_w3', 'e_wedding', 'Confirm final headcount with caterer', 'todo', 'medium', 'c_w_bayo', 10, 'Vendors'],
  ['t_w4', 'e_wedding', 'Draft order of programme', 'todo', 'medium', 'c_w_you', 6, 'Programme'],
  ['t_w5', 'e_wedding', 'Arrange guest shuttle from Lekki', 'todo', 'low', null, 14, 'Logistics'],
  ['t_w6', 'e_wedding', 'Book makeup trial', 'done', 'medium', 'c_w_you', -5, 'Beauty'],
  ['t_w7', 'e_wedding', 'Finalise aso-ebi colour and collection', 'done', 'high', 'c_w_tunde', -9, 'Attire'],
  ['t_b1', 'e_birthday', 'Confirm rooftop booking time', 'todo', 'high', 'c_b_you', -1, 'Venue'],
  ['t_b2', 'e_birthday', 'Approve cake design', 'todo', 'medium', 'c_b_kemi', 3, 'Vendors'],
  ['t_b3', 'e_birthday', 'Build the dinner playlist', 'done', 'low', 'c_b_kemi', -2, 'Programme'],
  ['t_b4', 'e_birthday', 'Print place cards', 'todo', 'low', 'c_b_you', 7, 'Decor'],
  ['t_c1', 'e_concert', 'Submit event permit application', 'todo', 'high', 'c_c_segun', -3, 'Compliance'],
  ['t_c2', 'e_concert', 'Lock sound & lighting rig plan', 'in_progress', 'high', 'c_c_halima', 5, 'Production'],
  ['t_c3', 'e_concert', 'Brief gate team on ticket check-in', 'todo', 'medium', 'c_c_you', 15, 'Operations'],
  ['t_c4', 'e_concert', 'Announce full lineup', 'done', 'medium', 'c_c_you', -4, 'Marketing'],
  ['t_c5', 'e_concert', 'Confirm security headcount', 'todo', 'medium', 'c_c_segun', 9, 'Operations'],
  ['t_n1', 'e_naming', 'Share photos with family', 'done', 'low', 'c_n_you', -10, 'Memories'],
  ['t_m1', 'e_mixer', 'Confirm three speakers', 'todo', 'medium', 'c_m_you', 12, 'Programme'],
  ['t_m2', 'e_mixer', 'Approve venue quote', 'todo', 'high', 'c_m_you', 4, 'Venue'],
  ['t_g1', 'e_grad', 'Choose a cover photo and publish', 'todo', 'low', 'c_g_you', 10, 'Setup']];

  const tasks: Task[] = taskRows.map(([id, eventId, title, status, priority, assigneeId, due, category]) => ({
    id, eventId, title, details: '', status, priority, assigneeId,
    dueDate: due === null ? null : at(due, 17), category, createdAt: at(-20),
    completedAt: status === 'done' ? at((due ?? 0) - 1, 15) : null
  }));

  /* ---------------- Guests ---------------- */
  type GuestRow = [string, string, string, RsvpStatus, number, InvitationStatus];
  const guestSet = (eventId: string, prefix: string, rows: GuestRow[]): Guest[] =>
  rows.map(([name, contact, group, rsvp, plusOnes, invitation], i) => ({
    id: `${prefix}${i + 1}`, eventId, name, contact, group, rsvp, invitation, plusOnes, note: '',
    respondedAt: rsvp === 'pending' ? null : at(-(i % 6) - 1, 12), source: 'organiser', createdAt: at(-30)
  }));
  const guests: Guest[] = [
  ...guestSet('e_wedding', 'g_w', [
  ['Chidinma Okafor', '0803 000 1142', 'Bride’s family', 'attending', 1, 'simulated_sent'],
  ['Emeka Okafor', '0805 000 2201', 'Bride’s family', 'attending', 2, 'simulated_sent'],
  ['Funke Bakare', '0812 000 4410', 'Groom’s family', 'attending', 1, 'simulated_sent'],
  ['Yinka Bakare', '0816 000 1290', 'Groom’s family', 'pending', 0, 'not_sent'],
  ['Sola Adebiyi', 'sola@example.com', 'Groom’s family', 'pending', 0, 'not_sent'],
  ['Nneka Obi', 'nneka@example.com', 'Friends', 'attending', 0, 'link_copied'],
  ['Ibrahim Sani', '0809 000 7718', 'Friends', 'declined', 0, 'simulated_sent'],
  ['Tola Martins', 'tola@example.com', 'Friends', 'pending', 1, 'link_copied'],
  ['Ugo Nwankwo', '0703 000 3321', 'Work', 'attending', 0, 'simulated_sent'],
  ['Grace Edet', 'grace@example.com', 'Work', 'pending', 0, 'not_sent'],
  ['Bolaji Ojo', '0802 000 5561', 'Groom’s family', 'pending', 2, 'not_sent'],
  ['Amina Bello', 'amina@example.com', 'Friends', 'attending', 1, 'simulated_sent'],
  ['Kelechi Ike', '0810 000 9902', 'Bride’s family', 'pending', 0, 'not_sent'],
  ['Ronke Ade', 'ronke@example.com', 'Work', 'declined', 0, 'simulated_sent']]
  ),
  ...guestSet('e_birthday', 'g_b', [
  ['Tobi Adeyemi', 'tobi@example.com', 'Close friends', 'attending', 0, 'simulated_sent'],
  ['Ngozi Chukwu', '0806 000 4433', 'Close friends', 'attending', 0, 'simulated_sent'],
  ['Seyi Lawal', 'seyi@example.com', 'Close friends', 'attending', 0, 'link_copied'],
  ['Femi Oke', '0813 000 2290', 'University', 'pending', 0, 'link_copied'],
  ['Hauwa Garba', 'hauwa@example.com', 'University', 'declined', 0, 'simulated_sent'],
  ['Zara Ahmed', 'zara@example.com', 'Work', 'attending', 0, 'simulated_sent'],
  ['Dayo Fashola', '0817 000 6610', 'Work', 'pending', 0, 'not_sent'],
  ['Ebere Nnaji', 'ebere@example.com', 'Family', 'attending', 0, 'simulated_sent']]
  ),
  ...guestSet('e_naming', 'g_n', [
  ['Grandma Nkechi', '0803 000 8812', 'Family', 'attending', 2, 'simulated_sent'],
  ['Obi Okafor', '0805 000 1188', 'Family', 'attending', 3, 'simulated_sent'],
  ['Pastor James', '0802 000 4455', 'Church', 'attending', 1, 'simulated_sent'],
  ['Mrs. Eze', '0809 000 7730', 'Neighbours', 'declined', 0, 'simulated_sent']]
  ),
  ...guestSet('e_mixer', 'g_m', [
  ['Uche Anyanwu', 'uche@example.com', 'Founders', 'attending', 0, 'simulated_sent'],
  ['Bisola Coker', 'bisola@example.com', 'Finance', 'attending', 0, 'simulated_sent'],
  ['Musa Danjuma', 'musa@example.com', 'Founders', 'pending', 0, 'link_copied']]
  )];


  /* ---------------- Vendors (fictional sample businesses) ---------------- */
  const vendors: Vendor[] = [
  {
    id: 'v_ofada', name: 'Ofada & Co. Catering', category: 'catering', tagline: 'Party jollof, small chops and full buffets',
    description: 'Event catering for 50 to 1,200 guests. Native and continental menus, live stations and on-site service staff.',
    city: 'Lagos', serviceAreas: ['Lagos', 'Ogun', 'Ibadan'], priceFrom: naira(450_000), priceTo: naira(9_000_000),
    portfolio: [images.catering, images.wedding, images.decor],
    services: [
    { id: 's_of1', name: 'Buffet service', description: 'Two proteins, three mains, sides and service staff', price: naira(8_500), unit: 'per guest' },
    { id: 's_of2', name: 'Small chops station', description: 'Puff-puff, samosa, spring rolls and peppered gizzard', price: naira(350_000), unit: 'per 100 guests' },
    { id: 's_of3', name: 'Live suya & asun grill', description: 'Grill master with two assistants for 4 hours', price: naira(280_000), unit: 'flat' }],

    contact: 'hello@ofada-co.example', responseTime: 'Usually replies within 4 hours', isMarketplace: true, isSample: true, createdAt: at(-200)
  },
  {
    id: 'v_bloom', name: 'Bloomhaus Decor Studio', category: 'decor', tagline: 'Floral design and full event styling',
    description: 'Floral installations, stage backdrops, centrepieces and lighting design for weddings and milestone celebrations.',
    city: 'Lagos', serviceAreas: ['Lagos', 'Abuja'], priceFrom: naira(750_000), priceTo: naira(12_000_000),
    portfolio: [images.decor, images.wedding, images.birthday],
    services: [
    { id: 's_bl1', name: 'Full reception styling', description: 'Stage, 60 tables, entrance and lighting', price: naira(4_200_000), unit: 'package' },
    { id: 's_bl2', name: 'Intimate dinner styling', description: 'Up to 40 guests, florals and candles', price: naira(650_000), unit: 'package' }],

    contact: 'studio@bloomhaus.example', responseTime: 'Usually replies within a day', isMarketplace: true, isSample: true, createdAt: at(-180)
  },
  {
    id: 'v_lens', name: 'Lenswork Africa', category: 'photography', tagline: 'Documentary-style photo and film',
    description: 'Two-shooter photo and video coverage, same-week highlight edits and printed albums.',
    city: 'Lagos', serviceAreas: ['Lagos', 'Abuja', 'Enugu', 'Port Harcourt'], priceFrom: naira(300_000), priceTo: naira(3_000_000),
    portfolio: [images.photographer, images.wedding, images.naming],
    services: [
    { id: 's_le1', name: 'Full-day photo + film', description: 'Two photographers, one videographer, highlight reel', price: naira(1_350_000), unit: 'package' },
    { id: 's_le2', name: 'Half-day photography', description: 'One photographer, 300+ edited images', price: naira(300_000), unit: 'package' }],

    contact: 'bookings@lenswork.example', responseTime: 'Usually replies within 2 hours', isMarketplace: true, isSample: true, createdAt: at(-160)
  },
  {
    id: 'v_glass', name: 'The Glasshouse', category: 'venue', tagline: 'Lakeside glass venue for 40–250 guests',
    description: 'A glass-walled hall with garden terrace, backup power and on-site parking for 80 cars.',
    city: 'Abuja', serviceAreas: ['Abuja'], priceFrom: naira(900_000), priceTo: naira(6_500_000),
    portfolio: [images.corporate, images.decor, images.birthday],
    services: [
    { id: 's_gl1', name: 'Evening hire (5 hours)', description: 'Hall, terrace, chairs and tables', price: naira(1_400_000), unit: 'flat' },
    { id: 's_gl2', name: 'Full-day hire', description: 'Twelve hours with setup access', price: naira(3_200_000), unit: 'flat' }],

    contact: 'events@glasshouse.example', responseTime: 'Usually replies within a day', isMarketplace: true, isSample: true, createdAt: at(-150)
  },
  {
    id: 'v_decibel', name: 'Decibel AV Rentals', category: 'audiovisual', tagline: 'Sound, light and LED screens',
    description: 'Line-array sound, stage lighting, LED walls and engineers for concerts and conferences.',
    city: 'Lagos', serviceAreas: ['Lagos', 'Ibadan', 'Abuja'], priceFrom: naira(400_000), priceTo: naira(8_000_000),
    portfolio: [images.concert, images.corporate],
    services: [
    { id: 's_db1', name: 'Concert rig', description: 'Line-array PA, 24 moving heads, 2 engineers', price: naira(3_800_000), unit: 'per night' },
    { id: 's_db2', name: 'Conference AV', description: 'PA, 2 mics, projector and screen', price: naira(400_000), unit: 'per day' }],

    contact: 'crew@decibel.example', responseTime: 'Usually replies within 6 hours', isMarketplace: true, isSample: true, createdAt: at(-140)
  },
  {
    id: 'v_crumbs', name: 'Crumbs & Candles', category: 'cake', tagline: 'Celebration cakes and dessert tables',
    description: 'Custom tiered cakes, cupcakes and dessert tables baked in Abuja.',
    city: 'Abuja', serviceAreas: ['Abuja'], priceFrom: naira(60_000), priceTo: naira(900_000),
    portfolio: [images.birthday, images.decor],
    services: [
    { id: 's_cr1', name: 'Two-tier celebration cake', description: 'Serves 40, two flavours', price: naira(180_000), unit: 'each' },
    { id: 's_cr2', name: 'Dessert table', description: 'Cupcakes, parfaits and macarons for 50', price: naira(250_000), unit: 'package' }],

    contact: 'orders@crumbs.example', responseTime: 'Usually replies within a day', isMarketplace: true, isSample: true, createdAt: at(-130)
  },
  {
    id: 'v_glow', name: 'Glow by Zainab', category: 'beauty', tagline: 'Bridal makeup and gele styling',
    description: 'Bridal and party makeup, gele tying and touch-up service throughout the event.',
    city: 'Lagos', serviceAreas: ['Lagos', 'Abuja'], priceFrom: naira(80_000), priceTo: naira(900_000),
    portfolio: [images.hero, images.wedding],
    services: [
    { id: 's_gw1', name: 'Bridal package', description: 'Trial, wedding-day makeup, gele and touch-ups', price: naira(480_000), unit: 'package' },
    { id: 's_gw2', name: 'Guest makeup', description: 'Per person, on location', price: naira(35_000), unit: 'per person' }],

    contact: 'book@glowbyzainab.example', responseTime: 'Usually replies within 3 hours', isMarketplace: true, isSample: true, createdAt: at(-120)
  },
  {
    id: 'v_drum', name: 'Talking Drum Live', category: 'entertainment', tagline: 'Highlife and juju live band',
    description: 'An eight-piece band for receptions, with MC partnership and a full sound check.',
    city: 'Enugu', serviceAreas: ['Enugu', 'Lagos', 'Port Harcourt'], priceFrom: naira(500_000), priceTo: naira(3_000_000),
    portfolio: [images.memories, images.concert],
    services: [{ id: 's_dr1', name: 'Four-hour live set', description: 'Eight musicians and own backline', price: naira(1_200_000), unit: 'flat' }],
    contact: 'band@talkingdrum.example', responseTime: 'Usually replies within a day', isMarketplace: true, isSample: true, createdAt: at(-110)
  },
  {
    id: 'v_femi', name: 'Uncle Femi’s Canopies', category: 'rentals', tagline: 'Recorded by organiser',
    description: 'Canopies, chairs and generators. Contact recorded manually by the planner; not a marketplace listing.',
    city: 'Lagos', serviceAreas: ['Lagos'], priceFrom: naira(650_000), priceTo: naira(650_000),
    portfolio: [], services: [], contact: '0802 000 3344', responseTime: 'Offline vendor', isMarketplace: false, isSample: true, createdAt: at(-40)
  }];


  /* ---------------- Budget ---------------- */
  type CatRow = [string, string, string, number];
  const catRows: CatRow[] = [
  ['bc_w_venue', 'e_wedding', 'Venue', 3_500_000], ['bc_w_food', 'e_wedding', 'Catering', 5_500_000],
  ['bc_w_decor', 'e_wedding', 'Decor', 4_500_000], ['bc_w_photo', 'e_wedding', 'Photo & film', 1_500_000],
  ['bc_w_beauty', 'e_wedding', 'Beauty', 600_000], ['bc_w_rent', 'e_wedding', 'Rentals', 800_000],
  ['bc_w_attire', 'e_wedding', 'Attire', 1_200_000], ['bc_w_misc', 'e_wedding', 'Contingency', 900_000],
  ['bc_b_venue', 'e_birthday', 'Venue', 800_000], ['bc_b_food', 'e_birthday', 'Food & drinks', 900_000],
  ['bc_b_cake', 'e_birthday', 'Cake', 200_000], ['bc_b_decor', 'e_birthday', 'Decor', 300_000], ['bc_b_misc', 'e_birthday', 'Extras', 200_000],
  ['bc_c_venue', 'e_concert', 'Venue', 4_500_000], ['bc_c_av', 'e_concert', 'Sound & lights', 4_000_000],
  ['bc_c_talent', 'e_concert', 'Talent', 2_500_000], ['bc_c_mkt', 'e_concert', 'Marketing', 600_000], ['bc_c_sec', 'e_concert', 'Security & gate', 400_000],
  ['bc_n_food', 'e_naming', 'Food', 600_000], ['bc_n_rent', 'e_naming', 'Rentals', 250_000], ['bc_n_photo', 'e_naming', 'Photography', 350_000],
  ['bc_m_venue', 'e_mixer', 'Venue', 1_500_000], ['bc_m_food', 'e_mixer', 'Catering', 1_200_000], ['bc_m_av', 'e_mixer', 'AV', 800_000],
  ['bc_g_food', 'e_grad', 'Food', 600_000], ['bc_g_decor', 'e_grad', 'Decor', 300_000]];

  const budgetCategories: BudgetCategory[] = catRows.map(([id, eventId, name, planned]) => ({ id, eventId, name, planned: naira(planned) }));

  const budgetItems: BudgetItem[] = [
  { id: 'bi_w_venue', eventId: 'e_wedding', categoryId: 'bc_w_venue', label: 'Lagoon View Hall — 8 hour hire', amount: naira(3_200_000), status: 'committed', note: 'Balance due one week before', createdAt: at(-60) },
  { id: 'bi_w_attire', eventId: 'e_wedding', categoryId: 'bc_w_attire', label: 'Aso-oke for couple and parents', amount: naira(1_150_000), status: 'estimate', note: 'Quote pending from weaver', createdAt: at(-30) },
  { id: 'bi_b_venue', eventId: 'e_birthday', categoryId: 'bc_b_venue', label: 'Skyline Rooftop booking', amount: naira(750_000), status: 'committed', note: '', createdAt: at(-25) },
  { id: 'bi_b_food', eventId: 'e_birthday', categoryId: 'bc_b_food', label: 'Set dinner for 35', amount: naira(875_000), status: 'estimate', note: '', createdAt: at(-25) },
  { id: 'bi_c_venue', eventId: 'e_concert', categoryId: 'bc_c_venue', label: 'Marina Open Grounds hire', amount: naira(4_200_000), status: 'committed', note: '', createdAt: at(-45) },
  { id: 'bi_c_talent', eventId: 'e_concert', categoryId: 'bc_c_talent', label: 'Headline act fee', amount: naira(2_200_000), status: 'committed', note: '50% upfront', createdAt: at(-40) },
  { id: 'bi_c_mkt', eventId: 'e_concert', categoryId: 'bc_c_mkt', label: 'Social ads & posters', amount: naira(450_000), status: 'estimate', note: '', createdAt: at(-30) },
  { id: 'bi_n_food', eventId: 'e_naming', categoryId: 'bc_n_food', label: 'Family cook & ingredients', amount: naira(520_000), status: 'committed', note: '', createdAt: at(-30) }];


  /* ---------------- Bookings ---------------- */
  const bookings: Booking[] = [
  { id: 'bk_w_decor', eventId: 'e_wedding', vendorId: 'v_bloom', categoryId: 'bc_w_decor', serviceName: 'Full reception styling', status: 'confirmed', agreedAmount: naira(4_200_000), depositAmount: naira(1_500_000), depositDueDate: at(1, 17), balanceDueDate: at(20, 17), notes: 'Coral and gold palette. Stage backdrop included.', createdAt: at(-21) },
  { id: 'bk_w_food', eventId: 'e_wedding', vendorId: 'v_ofada', categoryId: 'bc_w_food', serviceName: 'Buffet service for 600', status: 'confirmed', agreedAmount: naira(5_100_000), depositAmount: naira(2_000_000), depositDueDate: at(-10, 17), balanceDueDate: at(17, 17), notes: 'Final headcount needed 14 days before.', createdAt: at(-35) },
  { id: 'bk_w_photo', eventId: 'e_wedding', vendorId: 'v_lens', categoryId: 'bc_w_photo', serviceName: 'Full-day photo + film', status: 'requested', agreedAmount: naira(1_350_000), depositAmount: naira(400_000), depositDueDate: at(7, 17), balanceDueDate: null, notes: 'Awaiting vendor confirmation of the date.', createdAt: at(-4) },
  { id: 'bk_w_canopy', eventId: 'e_wedding', vendorId: 'v_femi', categoryId: 'bc_w_rent', serviceName: 'Canopies, 600 chairs, generator', status: 'confirmed', agreedAmount: naira(650_000), depositAmount: naira(650_000), depositDueDate: at(-15, 17), balanceDueDate: null, notes: 'Paid in full.', createdAt: at(-30) },
  { id: 'bk_w_glow', eventId: 'e_wedding', vendorId: 'v_glow', categoryId: 'bc_w_beauty', serviceName: 'Bridal package', status: 'confirmed', agreedAmount: naira(480_000), depositAmount: naira(200_000), depositDueDate: at(-3, 17), balanceDueDate: at(23, 12), notes: '', createdAt: at(-18) },
  { id: 'bk_b_cake', eventId: 'e_birthday', vendorId: 'v_crumbs', categoryId: 'bc_b_cake', serviceName: 'Two-tier celebration cake', status: 'confirmed', agreedAmount: naira(180_000), depositAmount: naira(90_000), depositDueDate: at(2, 17), balanceDueDate: at(8, 17), notes: 'Red velvet and vanilla.', createdAt: at(-8) },
  { id: 'bk_c_av', eventId: 'e_concert', vendorId: 'v_decibel', categoryId: 'bc_c_av', serviceName: 'Concert rig', status: 'confirmed', agreedAmount: naira(3_800_000), depositAmount: naira(1_900_000), depositDueDate: at(-14, 17), balanceDueDate: at(5, 17), notes: 'Load-in 10am on show day.', createdAt: at(-30) },
  { id: 'bk_n_photo', eventId: 'e_naming', vendorId: 'v_lens', categoryId: 'bc_n_photo', serviceName: 'Half-day photography', status: 'confirmed', agreedAmount: naira(300_000), depositAmount: naira(300_000), depositDueDate: at(-20, 17), balanceDueDate: null, notes: '', createdAt: at(-30) },
  { id: 'bk_m_venue', eventId: 'e_mixer', vendorId: 'v_glass', categoryId: 'bc_m_venue', serviceName: 'Evening hire (5 hours)', status: 'requested', agreedAmount: naira(1_400_000), depositAmount: naira(700_000), depositDueDate: at(14, 17), balanceDueDate: null, notes: '', createdAt: at(-3) }];


  /* ---------------- Transactions (all simulated) ---------------- */
  let refN = 1000;
  const txn = (p: Partial<Transaction> & Pick<Transaction, 'id' | 'eventId' | 'direction' | 'kind' | 'amount' | 'status' | 'counterparty'>, days: number): Transaction => ({
    reference: `JFDEMO-SEED-${(refN++).toString(36).toUpperCase()}`, note: '', bookingId: null, budgetItemId: null, giftItemId: null, ticketOrderId: null,
    simulated: true, createdAt: at(days, 13), updatedAt: at(days, 13), ...p
  });
  const transactions: Transaction[] = [
  txn({ id: 'tx_w1', eventId: 'e_wedding', direction: 'out', kind: 'vendor_payment', amount: naira(2_000_000), status: 'success', counterparty: 'Ofada & Co. Catering', bookingId: 'bk_w_food', note: 'Catering deposit' }, -11),
  txn({ id: 'tx_w2', eventId: 'e_wedding', direction: 'out', kind: 'vendor_payment', amount: naira(650_000), status: 'success', counterparty: 'Uncle Femi’s Canopies', bookingId: 'bk_w_canopy', note: 'Paid in full' }, -16),
  txn({ id: 'tx_w3', eventId: 'e_wedding', direction: 'out', kind: 'expense_payment', amount: naira(1_600_000), status: 'success', counterparty: 'Lagoon View Hall', budgetItemId: 'bi_w_venue', note: 'Venue 50% deposit' }, -50),
  txn({ id: 'tx_w4', eventId: 'e_wedding', direction: 'out', kind: 'vendor_payment', amount: naira(200_000), status: 'pending', counterparty: 'Glow by Zainab', bookingId: 'bk_w_glow', note: 'Deposit transfer awaiting confirmation' }, -2),
  txn({ id: 'tx_w5', eventId: 'e_wedding', direction: 'in', kind: 'contribution', amount: naira(2_000_000), status: 'success', counterparty: 'Okafor family', note: 'Family contribution' }, -20),
  txn({ id: 'tx_w6', eventId: 'e_wedding', direction: 'in', kind: 'contribution', amount: naira(500_000), status: 'pending', counterparty: 'Uncle Chuka Eze', note: 'Pledged, transfer not yet confirmed' }, -3),
  txn({ id: 'tx_w7', eventId: 'e_wedding', direction: 'in', kind: 'gift_contribution', amount: naira(250_000), status: 'success', counterparty: 'Bisi & Kayode', giftItemId: 'gi_w_honey', note: 'Enjoy Zanzibar!' }, -6),
  txn({ id: 'tx_w8', eventId: 'e_wedding', direction: 'in', kind: 'gift_contribution', amount: naira(250_000), status: 'success', counterparty: 'Mr. & Mrs. Adeleke', giftItemId: 'gi_w_honey' }, -4),
  txn({ id: 'tx_w9', eventId: 'e_wedding', direction: 'in', kind: 'gift_contribution', amount: naira(100_000), status: 'failed', counterparty: 'Ifeanyi O.', giftItemId: 'gi_w_honey', note: 'Simulated card decline' }, -1),
  txn({ id: 'tx_b1', eventId: 'e_birthday', direction: 'out', kind: 'expense_payment', amount: naira(375_000), status: 'success', counterparty: 'Skyline Rooftop', budgetItemId: 'bi_b_venue', note: '50% deposit' }, -20),
  txn({ id: 'tx_b2', eventId: 'e_birthday', direction: 'in', kind: 'gift_contribution', amount: naira(150_000), status: 'success', counterparty: 'Ngozi C.', giftItemId: 'gi_b_obudu' }, -5),
  txn({ id: 'tx_b3', eventId: 'e_birthday', direction: 'in', kind: 'gift_contribution', amount: naira(75_000), status: 'success', counterparty: 'Seyi L.', giftItemId: 'gi_b_obudu' }, -3),
  txn({ id: 'tx_b4', eventId: 'e_birthday', direction: 'in', kind: 'gift_contribution', amount: naira(50_000), status: 'pending', counterparty: 'Femi O.', giftItemId: 'gi_b_obudu' }, -1),
  txn({ id: 'tx_b5', eventId: 'e_birthday', direction: 'in', kind: 'gift_contribution', amount: naira(120_000), status: 'success', counterparty: 'The girls', giftItemId: 'gi_b_spa' }, -7),
  txn({ id: 'tx_c1', eventId: 'e_concert', direction: 'out', kind: 'vendor_payment', amount: naira(1_900_000), status: 'success', counterparty: 'Decibel AV Rentals', bookingId: 'bk_c_av', note: 'Deposit' }, -15),
  txn({ id: 'tx_c2', eventId: 'e_concert', direction: 'out', kind: 'vendor_payment', amount: naira(500_000), status: 'failed', counterparty: 'Decibel AV Rentals', bookingId: 'bk_c_av', note: 'Part-balance transfer failed (simulated)' }, -1),
  txn({ id: 'tx_c3', eventId: 'e_concert', direction: 'out', kind: 'expense_payment', amount: naira(4_200_000), status: 'success', counterparty: 'Marina Open Grounds', budgetItemId: 'bi_c_venue' }, -40),
  txn({ id: 'tx_c4', eventId: 'e_concert', direction: 'out', kind: 'expense_payment', amount: naira(1_100_000), status: 'success', counterparty: 'Headline act management', budgetItemId: 'bi_c_talent', note: '50% upfront' }, -30),
  txn({ id: 'tx_n1', eventId: 'e_naming', direction: 'out', kind: 'vendor_payment', amount: naira(300_000), status: 'success', counterparty: 'Lenswork Africa', bookingId: 'bk_n_photo' }, -21),
  txn({ id: 'tx_n2', eventId: 'e_naming', direction: 'out', kind: 'expense_payment', amount: naira(520_000), status: 'success', counterparty: 'Family cook', budgetItemId: 'bi_n_food' }, -13),
  txn({ id: 'tx_n3', eventId: 'e_naming', direction: 'in', kind: 'gift_contribution', amount: naira(250_000), status: 'success', counterparty: 'Grandma Nkechi', giftItemId: 'gi_n_edu' }, -12),
  txn({ id: 'tx_n4', eventId: 'e_naming', direction: 'in', kind: 'gift_contribution', amount: naira(150_000), status: 'success', counterparty: 'Obi family', giftItemId: 'gi_n_edu' }, -12)];


  /* ---------------- Gifts ---------------- */
  const giftItems: GiftItem[] = [
  { id: 'gi_w_honey', eventId: 'e_wedding', name: 'Honeymoon in Zanzibar', description: 'Help us get to the beach after the owambe.', kind: 'cash_fund', targetAmount: naira(3_000_000), priceHint: null, status: 'available', reservedBy: null, createdAt: at(-40) },
  { id: 'gi_w_mixer', eventId: 'e_wedding', name: 'Stand mixer', description: 'For many Sunday cakes.', kind: 'physical', targetAmount: null, priceHint: naira(650_000), status: 'reserved', reservedBy: 'Aunty Funke', createdAt: at(-40) },
  { id: 'gi_w_home', eventId: 'e_wedding', name: 'New home fund', description: 'Furniture for our first apartment in Yaba.', kind: 'cash_fund', targetAmount: naira(1_500_000), priceHint: null, status: 'available', reservedBy: null, createdAt: at(-40) },
  { id: 'gi_w_bed', eventId: 'e_wedding', name: 'Cotton bedding set', description: 'King size, any neutral colour.', kind: 'physical', targetAmount: null, priceHint: naira(220_000), status: 'available', reservedBy: null, createdAt: at(-40) },
  { id: 'gi_b_obudu', eventId: 'e_birthday', name: 'Obudu weekend getaway', description: 'A cool-weather reset at the cattle ranch.', kind: 'cash_fund', targetAmount: naira(600_000), priceHint: null, status: 'available', reservedBy: null, createdAt: at(-20) },
  { id: 'gi_b_cam', eventId: 'e_birthday', name: 'Instant film camera', description: 'To capture the next decade.', kind: 'physical', targetAmount: null, priceHint: naira(160_000), status: 'reserved', reservedBy: 'Tobi A.', createdAt: at(-20) },
  { id: 'gi_b_pot', eventId: 'e_birthday', name: 'Cast-iron casserole', description: 'Big enough for party stew.', kind: 'physical', targetAmount: null, priceHint: naira(320_000), status: 'available', reservedBy: null, createdAt: at(-20) },
  { id: 'gi_b_spa', eventId: 'e_birthday', name: 'Spa day', description: 'A full day off. Fully funded already, thank you!', kind: 'cash_fund', targetAmount: naira(120_000), priceHint: null, status: 'available', reservedBy: null, createdAt: at(-20) },
  { id: 'gi_n_edu', eventId: 'e_naming', name: 'Chiamaka’s education fund', description: 'A head start for our daughter.', kind: 'cash_fund', targetAmount: naira(1_000_000), priceHint: null, status: 'available', reservedBy: null, createdAt: at(-30) },
  { id: 'gi_n_carrier', eventId: 'e_naming', name: 'Baby carrier', description: 'Ergonomic, for long walks.', kind: 'physical', targetAmount: null, priceHint: naira(95_000), status: 'received', reservedBy: 'Pastor James', createdAt: at(-30) }];


  /* ---------------- Tickets ---------------- */
  const ticketTiers: TicketTier[] = [
  { id: 'tt_c_reg', eventId: 'e_concert', name: 'Regular', description: 'General admission standing', price: naira(15_000), quantity: 400, maxPerOrder: 6, status: 'on_sale' },
  { id: 'tt_c_vip', eventId: 'e_concert', name: 'VIP', description: 'Raised deck, fast-track entry, one drink', price: naira(50_000), quantity: 80, maxPerOrder: 4, status: 'on_sale' },
  { id: 'tt_c_table', eventId: 'e_concert', name: 'Table for 6', description: 'Reserved table near stage, bottle service', price: naira(450_000), quantity: 2, maxPerOrder: 1, status: 'on_sale' },
  { id: 'tt_o_reg', eventId: 'e_owambe', name: 'Regular', description: 'Entry and small chops', price: naira(10_000), quantity: 300, maxPerOrder: 6, status: 'on_sale' },
  { id: 'tt_j_reg', eventId: 'e_jollof', name: 'Tasting pass', description: 'Taste all twelve kitchens', price: naira(5_000), quantity: 800, maxPerOrder: 6, status: 'on_sale' }];


  type OrderRow = [string, string, number, string, string, 'paid' | 'failed', number, string[]];
  const orderRows: OrderRow[] = [
  ['to_1', 'tt_c_reg', 2, 'Damilola Ade', 'damilola@example.com', 'paid', -9, ['JF-7Q2K-M8VA', 'JF-H3RT-2WXN']],
  ['to_2', 'tt_c_vip', 1, 'Ifeanyi Obi', 'ifeanyi@example.com', 'paid', -8, ['JF-VIP4-QZ7C']],
  ['to_3', 'tt_c_reg', 4, 'Zainab Lawal', 'zainab@example.com', 'paid', -6, ['JF-K9PM-3TRA', 'JF-B2NE-8YUQ', 'JF-P5WD-6HGS', 'JF-M7XC-4LKE']],
  ['to_4', 'tt_c_table', 1, 'Oluwaseun Bello', 'seun@example.com', 'paid', -5, ['JF-TB01-RQ8M']],
  ['to_5', 'tt_c_table', 1, 'Kunle Ajayi', 'kunle@example.com', 'paid', -4, ['JF-TB02-ZX3P']],
  ['to_6', 'tt_c_reg', 1, 'Ebuka Nwosu', 'ebuka@example.com', 'failed', -3, []],
  ['to_7', 'tt_c_vip', 2, 'Amaka Chukwu', 'amaka@example.com', 'paid', -2, ['JF-VIP8-WN5D', 'JF-VIP9-CT2H']]];

  const tierPrice: Record<string, number> = Object.fromEntries(ticketTiers.map((t) => [t.id, t.price]));
  const ticketOrders: TicketOrder[] = orderRows.map(([id, tierId, quantity, buyerName, buyerEmail, status, days]) => ({
    id, eventId: 'e_concert', tierId, quantity, buyerName, buyerEmail, total: tierPrice[tierId] * quantity, status,
    reference: `JFDEMO-SEED-${id.toUpperCase()}`, idempotencyKey: `seed_${id}`, createdAt: at(days, 15)
  }));
  const tickets: Ticket[] = orderRows.flatMap(([orderId, tierId,, buyerName,,,, codes]) =>
  codes.map((code, i) => ({
    id: `tk_${orderId}_${i + 1}`, orderId, eventId: 'e_concert', tierId, code,
    holderName: i === 0 ? buyerName : `${buyerName} (guest ${i})`,
    status: code === 'JF-M7XC-4LKE' ? 'cancelled' : 'valid', checkedInAt: null
  }))
  );
  ticketOrders.forEach((o) => {
    transactions.push(
      txn({ id: `tx_${o.id}`, eventId: 'e_concert', direction: 'in', kind: 'ticket_sale', amount: o.total, status: o.status === 'paid' ? 'success' : 'failed', counterparty: o.buyerName, ticketOrderId: o.id, reference: o.reference, note: o.status === 'failed' ? 'Simulated payment failure' : '' }, -3)
    );
  });

  /* ---------------- Memories ---------------- */
  const memories: Memory[] = [
  { id: 'm_n1', eventId: 'e_naming', url: images.naming, caption: 'The naming moment', uploadedBy: 'Ada Okafor', createdAt: at(-12, 17), localOnly: false },
  { id: 'm_n2', eventId: 'e_naming', url: images.memories, caption: 'Cousins’ selfie corner', uploadedBy: 'Obi Okafor', createdAt: at(-12, 18), localOnly: false },
  { id: 'm_n3', eventId: 'e_naming', url: images.catering, caption: 'Lunch is served', uploadedBy: 'Ada Okafor', createdAt: at(-12, 18), localOnly: false },
  { id: 'm_n4', eventId: 'e_naming', url: images.photographer, caption: 'Behind the lens', uploadedBy: 'Lenswork Africa', createdAt: at(-11, 9), localOnly: false }];


  /* ---------------- Activity & updates ---------------- */
  const act = (id: string, eventId: string, kind: Activity['kind'], message: string, actor: string, hoursAgo: number, link: string | null): Activity => ({
    id, eventId, kind, message, actor, link, createdAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString()
  });
  const activities: Activity[] = [
  act('a1', 'e_wedding', 'rsvp', 'Amina Bello is attending (+1)', 'Amina Bello', 2, '/app/events/e_wedding/guests'),
  act('a2', 'e_concert', 'ticket', 'Amaka Chukwu bought 2 VIP tickets (simulated)', 'Amaka Chukwu', 5, '/app/events/e_concert/tickets'),
  act('a3', 'e_wedding', 'payment', 'Deposit of ₦200,000 to Glow by Zainab is pending confirmation', 'Ngozi Eze', 9, '/app/events/e_wedding/money'),
  act('a4', 'e_birthday', 'gift', 'Femi O. pledged ₦50,000 to the Obudu fund (pending)', 'Femi O.', 20, '/app/events/e_birthday/gifts'),
  act('a5', 'e_concert', 'payment', 'Transfer of ₦500,000 to Decibel AV failed (simulated)', 'Segun Ola', 26, '/app/events/e_concert/money'),
  act('a6', 'e_wedding', 'gift', 'Ifeanyi O.’s ₦100,000 honeymoon contribution failed (simulated)', 'Ifeanyi O.', 28, '/app/events/e_wedding/gifts'),
  act('a7', 'e_mixer', 'booking', 'Booking request sent to The Glasshouse', 'Ada Okafor', 70, '/app/events/e_mixer/vendors'),
  act('a8', 'e_wedding', 'booking', 'Booking request sent to Lenswork Africa', 'Bayo Adeyemi', 96, '/app/events/e_wedding/vendors'),
  act('a9', 'e_concert', 'task', 'Segun Ola completed “Announce full lineup”', 'Segun Ola', 100, '/app/events/e_concert/plan'),
  act('a10', 'e_wedding', 'task', 'Ada Okafor completed “Book makeup trial”', 'Ada Okafor', 130, '/app/events/e_wedding/plan'),
  act('a11', 'e_naming', 'memory', '4 photos added to the gallery', 'Ada Okafor', 270, '/app/events/e_naming/memories')];


  const announcements: Announcement[] = [
  { id: 'an_c1', eventId: 'e_concert', title: 'Full lineup announced', body: 'Four acts confirmed. Gates open 6pm, first act on stage at 7:30pm. Bring a valid ID with your ticket.', isPublic: true, author: 'Ada Okafor Events', createdAt: at(-4, 12) },
  { id: 'an_w1', eventId: 'e_wedding', title: 'Aso-ebi collection this Saturday', body: 'Collection at the Okafor residence, 10am–4pm. Please bring your payment confirmation.', isPublic: true, author: 'Adaeze & Tunde', createdAt: at(-2, 9) },
  { id: 'an_b1', eventId: 'e_birthday', title: 'Parking update', body: 'Use the basement entrance on Adetokunbo Ademola Crescent. Valet from 6:30pm.', isPublic: true, author: 'Kemi', createdAt: at(-1, 18) }];


  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    events, collaborators, tasks, guests, vendors, bookings, budgetCategories, budgetItems, transactions,
    giftItems, ticketTiers, ticketOrders, tickets, memories, activities, announcements
  };
}