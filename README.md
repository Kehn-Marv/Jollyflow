# JolliFlow

**Every event. One clear plan.**

JolliFlow is a Nigeria-first event planning and operations platform designed to help hosts and professional planners coordinate people, vendors, tasks, event budgets, contributions, and event-day activities from one connected workspace.

Instead of spreading important details across WhatsApp chats, spreadsheets, payment receipts, and separate vendor conversations, JolliFlow brings the moving parts of an event together—and makes it easier to see what is confirmed, what is outstanding, and what needs attention next.

> **Project context:** JolliFlow is being developed for the Wema Bank Hackaholics 7.0 hackathon. The product is designed with a future Wema/ALAT integration in mind. A live banking integration, real-money collection, and production payouts must not be assumed unless they have been separately implemented, tested, and authorised.

---

## Contents

- [The problem](#the-problem)
- [Our approach](#our-approach)
- [Who JolliFlow is for](#who-jolliflow-is-for)
- [Core capabilities](#core-capabilities)
- [What makes JolliFlow different](#what-makes-jolliflow-different)
- [Product status and demo mode](#product-status-and-demo-mode)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Application architecture](#application-architecture)
- [Key product concepts](#key-product-concepts)
- [Financial integrity and Wema/ALAT integration](#financial-integrity-and-wemaa-lat-integration)
- [Security and privacy](#security-and-privacy)
- [Testing and quality checks](#testing-and-quality-checks)
- [Roadmap](#roadmap)
- [Team and contribution workflow](#team-and-contribution-workflow)
- [Disclaimer](#disclaimer)

---

## The problem

Planning an event is often a coordination problem disguised as a celebration. Hosts may need to manage guest responses, family contributions, vendor deposits, deadlines, budgets, ticket sales, and last-minute changes across several disconnected tools.

When information is scattered, it becomes difficult to answer basic questions:

- Who is responsible for the next task?
- Which guests have confirmed?
- Has a vendor confirmed the booking?
- Which deposits have been paid, and which remain outstanding?
- How much has been budgeted, committed, spent, or received?
- What needs attention before event day?

JolliFlow is designed to bring those answers into one event workspace.

## Our approach

JolliFlow treats the **event as the central record**. Guests, invitations, tasks, collaborators, vendor bookings, budgets, contributions, tickets, and memories can all be connected to the event they belong to.

The goal is not simply to provide a longer list of features. It is to make the information across those features work together, so a change in one part of an event can be reflected where it matters elsewhere.

For example, a vendor booking can have a service amount, a deposit deadline, a payment state, and a responsible person. If the deposit is still outstanding, the planner should be able to see that commitment and act on it without searching through unrelated conversations.

## Who JolliFlow is for

### Hosts and professional event planners
Create events, organise tasks, coordinate collaborators, manage guest lists, monitor budgets, and keep vendor commitments visible.

### Guests and attendees
Open a shareable event page, review event details, RSVP, register or purchase a demo ticket where applicable, and access event updates.

### Vendors
Showcase services, receive booking enquiries, and keep event-specific service and payment commitments organised.

### Gift-givers and contributors
Explore a wishlist or contribution option and see a clear record of the relevant gift or contribution flow.

A single user may play more than one role—for example, hosting one event and attending another.

## Core capabilities

The availability of each capability depends on the current implementation and environment. Features that rely on a production backend or an approved provider integration must be treated as unavailable until verified.

- **Event management:** create, edit, publish, view, and manage events.
- **Planner workspace:** review upcoming events, tasks, activity, and items requiring attention.
- **Tasks and responsibilities:** assign work, set deadlines, and track progress.
- **Guests and RSVPs:** manage guest records, invitation states, and attendance responses.
- **Shareable event pages:** provide a public-facing view of an event without exposing private planning information.
- **Vendor coordination:** browse sample vendors or record an external vendor, then associate a booking request with an event.
- **Budget visibility:** distinguish planned costs, committed expenses, confirmed payments, and outstanding amounts.
- **Gifting and contributions:** represent gift registries, wishlist items, and contribution states separately.
- **Tickets and check-in:** support the planned ticket-order and event-access workflow, subject to the active demo or backend configuration.
- **Memories:** provide an event-linked place to preview or manage photos and other media where implemented.
- **Event Operations Intelligence:** surface explainable, rule-based reminders about overdue tasks, pending bookings, upcoming deposits, and other unresolved items.

## What makes JolliFlow different

### 1. Event Operations Intelligence
JolliFlow is intended to help organisers understand not only what has happened, but also what is still outstanding. Operational reminders should link to the relevant task, booking, guest record, or financial commitment rather than presenting unexplained alerts.

### 2. Clear event finances
Budgets, commitments, expenses, contributions, transactions, and payouts are different concepts. JolliFlow is designed to keep them separate so an estimate or pending payment is not misrepresented as money already received or paid.

### 3. Designed for Nigerian event workflows
The product is shaped around common event types and coordination needs in Nigeria, including birthdays, weddings, traditional weddings, naming ceremonies, graduations, parties, community gatherings, and live events. Financial values are presented in Nigerian naira where applicable.

### 4. One connected event lifecycle
The long-term experience connects planning, invitations, guests, vendors, financial records, event-day operations, and memories instead of treating each as an isolated utility.

---

## Product status and demo mode

JolliFlow is being developed in stages: **frontend first, followed by backend and approved banking-provider integration**.

Depending on the current build, some workflows may use seeded demonstration data or local browser persistence. In demo mode:

- Sample events, guests, vendors, testimonials, and financial records are illustrative—not verified real-world records.
- A simulated payment is not a real payment and does not move money.
- A local success state does not prove that a bank transaction has succeeded.
- Browser-local data may be specific to the browser or device and may be cleared when demo data is reset.
- An upload preview does not necessarily mean a file has been permanently stored on a server.

The application should clearly label simulated activity and should never describe a mock transaction as a completed Wema/ALAT transaction.

## Getting started

### Prerequisites

- Git
- Node.js and a package manager supported by the repository
- A modern browser

Use the Node.js version specified by the project, if one is pinned in its configuration or documentation.

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

Replace the placeholders with the actual repository URL and directory name.

### 2. Install dependencies

Use the package manager that matches the lockfile committed to the repository.

```bash
npm install
```

If the repository uses `package-lock.json` in a clean CI environment, `npm ci` is generally preferable for reproducible installation. Use the corresponding install command if the project uses pnpm or Yarn instead.

### 3. Configure environment variables

If the project provides an `.env.example`, copy it to the appropriate local environment file and populate only the values needed for local development.

On Windows PowerShell, for example:

```powershell
Copy-Item .env.example .env
```

Do not create real banking credentials for the frontend-only demo. Do not commit `.env` files or secrets.

### 4. Start the development server

For a project that defines the standard `dev` script:

```bash
npm run dev
```

Open the local URL printed by the development server. The actual command and URL are determined by the repository's `package.json` and framework configuration.

### 5. Build for production

```bash
npm run build
```

Use the scripts actually defined in `package.json`. Optional commands such as linting, type-checking, and tests should likewise be run if they are configured in the project.

> **Note:** Verify these commands against the repository before publishing this README. Do not add scripts to documentation that do not exist in the codebase.

---

## Configuration

The exact variables depend on the active implementation. Document all required variables in `.env.example` and keep the example file free of real secrets.

Typical future configuration categories may include:

| Variable or setting | Purpose |
|---|---|
| Public application URL | Base URL used for navigation and shareable event links |
| API base URL | Backend endpoint used by the frontend when API mode is enabled |
| Demo mode | Enables seeded/local demonstration behaviour when supported |
| Database URL | Server-side database connection, required only for the backend |
| Session/authentication settings | Server-side authentication configuration, required only for the backend |
| Wema/ALAT test credentials | Server-side integration credentials, only when the relevant API product and access have been confirmed |
| Object-storage configuration | Server-side media storage, if the backend uses an object-storage provider |

These are configuration categories, not a claim that every variable is currently implemented. Use the exact variable names found in the application.

Never put bank API secrets, signing secrets, private keys, or server-only tokens in frontend-exposed environment variables.

## Application architecture

The frontend should separate visual components from product rules and data access. Where implemented, the intended boundaries are:

- **UI and routes:** responsive pages, reusable components, forms, navigation, and accessible interaction states.
- **Domain models:** typed representations of events, users, guests, tasks, vendors, bookings, budgets, contributions, tickets, and memories.
- **Service interfaces:** stable operations used by the UI to retrieve or modify application data.
- **Demo service adapter:** seeded data and local demonstration behaviour.
- **API service adapter:** future connection to the authenticated backend.
- **Banking-provider adapter:** backend-only integration for the specific Wema/ALAT capabilities authorised for the project.

The frontend should not directly perform privileged banking operations. The backend must validate user permissions, verify provider responses, and authoritatively manage transaction state.

The actual folder structure and technology choices should be taken from the repository, not inferred from this conceptual architecture.

## Key product concepts

A reliable event platform needs to keep several related concepts distinct:

| Concept | Meaning |
|---|---|
| Event | The central occasion and shared planning context |
| Invitation | A request for a person to attend |
| RSVP | The person's response to the invitation |
| Ticket order | An order for one or more tickets |
| Ticket/check-in | Admission entitlement and its validation at the event |
| Vendor profile | Information about a provider or business |
| Vendor booking | An event-specific request or agreement with a vendor |
| Budget | A plan for how much an event should cost |
| Commitment | An agreed or expected cost, such as a vendor booking |
| Transaction | A recorded financial operation with its own verified status |
| Contribution | Money pledged or provided towards an event or gift, with its actual payment state tracked separately |
| Memory | Media or other content associated with an event |

These distinctions prevent a pending payment from being counted as paid, an RSVP from being treated as attendance, or a vendor profile from being confused with a confirmed booking.

## Financial integrity and Wema/ALAT integration

JolliFlow is designed with a future integration path for approved Wema/ALAT banking capabilities. The integration must be based on the specific official API product, documentation, credentials, permissions, and use case available to the project.

Official developer portal: <https://wema-alatdev-apimgt.developer.azure-api.net/>

The existence of an account, transfer, payment, or payout API does not automatically mean it can be used for every collection, checkout, refund, or merchant-settlement workflow. Those capabilities must be checked individually.

Until a specific flow has been implemented and verified:

- Treat demo payments as simulated.
- Do not claim that money has moved based on a frontend success message.
- Do not expose banking credentials in browser code.
- Do not claim a formal Wema Bank partnership or endorsement without authorisation.
- Keep payment collection, payment verification, payouts, and refunds distinct.

When the backend is added, the server should verify payment status through the authorised provider flow, safely process duplicate or delayed callbacks, retain transaction references, and maintain an auditable financial record.

## Security and privacy

Security controls depend on the deployment stage, but production use should include:

- Server-enforced authorisation for private events and restricted records.
- Secure authentication and session management.
- Validation of all incoming data.
- Server-side verification of payment states and amounts.
- Secrets stored only in server-side configuration or an appropriate secrets manager.
- File-upload type and size restrictions, with controlled access to private media.
- Appropriate retention and deletion rules for personal data.
- Safe error messages that do not expose credentials, stack traces, or private information.

Never use real personal, banking, or payment information in a public demonstration dataset.

## Testing and quality checks

Before a demo or release, verify the workflows that exist in the current build:

- The application starts and builds successfully.
- Navigation opens valid routes.
- Event creation and editing preserve entered details.
- Guest and RSVP changes appear in the correct event.
- Booking and budget changes update their related views.
- Pending, failed, and successful demo-payment states remain distinct.
- Ticket quantities and check-in states behave consistently, where implemented.
- Refreshing the browser preserves the demo data that is documented as persistent.
- Private event details are not exposed on public pages.
- The layout remains usable on mobile, tablet, and desktop.
- No essential controls are dead ends.

Use the tests and scripts available in the repository. Report any untested or incomplete workflow honestly rather than assuming it works because the page renders.

## Roadmap

The roadmap may change as the team validates the highest-value workflows.

### Stage 1 — Frontend experience
- Establish the JolliFlow visual identity and responsive design system.
- Build the planner dashboard and event-creation flow.
- Connect tasks, guests, vendors, and event financial views with coherent demo data.
- Build public event pages and working local demo interactions.

### Stage 2 — Backend foundation
- Add persistent database storage and versioned APIs.
- Implement secure authentication and event-level permissions.
- Connect the frontend service layer to the backend.
- Add transactional workflows, audit history, and automated tests.

### Stage 3 — Approved financial integration
- Confirm the exact Wema/ALAT APIs and access available to the team.
- Implement only supported and authorised collection, verification, or payout flows.
- Add idempotency, reconciliation, failure handling, and secure callback processing.
- Test in the provider's approved environment before considering production use.

### Stage 4 — Operational intelligence and expansion
- Improve deadline and commitment alerts.
- Add reusable event playbooks and multi-event planner reporting.
- Expand vendor workflows, ticketing, memories, and other features based on validated user needs.

## Team and contribution workflow

JolliFlow is being built by a small team. Keep changes focused, preserve the established design system, and document any changes to shared domain models or service contracts.

Recommended workflow:

1. Create a branch for a focused feature or fix.
2. Implement the feature and its relevant loading, empty, success, and error states.
3. Run the applicable build, lint, type-check, and test commands.
4. Test the affected journey at desktop and mobile widths.
5. Document any change to API contracts, environment settings, or demo behaviour.
6. Submit the changes for review before merging.

## Disclaimer

JolliFlow is an independent project developed for a hackathon context. It is not an official Wema Bank or ALAT product, and no partnership or endorsement should be implied unless formally authorised. Banking and payment functionality is subject to the actual provider products, approvals, agreements, and integrations available to the team.

**JolliFlow — every event. One clear plan.**
