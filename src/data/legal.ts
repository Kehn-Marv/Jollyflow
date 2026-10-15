export interface LegalSection {
  heading: string;
  body: string[];
}

export const privacySections: LegalSection[] = [
{ heading: 'What this prototype stores', body: ['In this frontend prototype, everything you enter (events, guests, budgets, demo payments) is stored only in your own browser’s local storage on this device. Nothing is sent to a JolliFlow server because no server exists yet.', 'Uploaded photos are shown as temporary previews and are not uploaded anywhere. They disappear when you refresh.'] },
{ heading: 'Information a future production service may process', body: ['Account details (name, email, phone), event details, guest names and contact details provided by organisers, vendor information, and records of payments processed through a licensed payment partner.'] },
{ heading: 'What public event pages show', body: ['Public pages show only event title, description, date, venue, organiser name, public updates and, where enabled, ticket or gift options. Budgets, guest lists, vendor terms, transactions and private memories are never shown publicly.'] },
{ heading: 'Your controls', body: ['You can clear all prototype data from Settings → Reset demo data, or by clearing your browser storage. A production version would provide account deletion and data export.'] },
{ heading: 'Payments', body: ['All payments in this prototype are simulations. No card, bank or wallet details are collected and no money moves.'] }];


export const termsSections: LegalSection[] = [
{ heading: 'Prototype status', body: ['JolliFlow is a hackathon prototype built for demonstration. It is provided as-is, without warranties, and must not be used to manage real funds or binding commitments.'] },
{ heading: 'Simulated payments', body: ['Checkout, contributions and vendor payments are simulated. A “confirmed” status in this prototype does not represent a real transaction. No bank, payment provider or financial institution is integrated, and no partnership or endorsement is implied.'] },
{ heading: 'Sample content', body: ['Vendors, events, people and testimonials shown in the demo are fictional sample content. They are not real businesses or customers and have not been verified.'] },
{ heading: 'Organiser responsibilities', body: ['In a future production version, organisers would be responsible for the accuracy of event details, for obtaining guest consent before adding contact information, and for honouring commitments made to vendors and ticket buyers.'] },
{ heading: 'Changes', body: ['These prototype terms will be replaced by reviewed terms of service before any public launch.'] }];