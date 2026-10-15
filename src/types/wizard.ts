import type { CollaboratorRole, EventFeatures, EventType, Visibility } from './domain';

/** Form state for the create-event wizard. Money fields are raw input strings until submit. */
export interface WizardDraft {
  type: EventType | null;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  address: string;
  coverUrl: string;
  visibility: Visibility;
  rsvpEnabled: boolean;
  capacity: string;
  plusOnesAllowed: boolean;
  budget: string;
  categories: Array<{id: string;name: string;planned: string;enabled: boolean;}>;
  collaborators: Array<{id: string;name: string;email: string;role: CollaboratorRole;}>;
  features: EventFeatures;
  tier: {name: string;price: string;quantity: string;};
  publish: boolean;
}

export type WizardField =
'type' |
'title' |
'date' |
'startTime' |
'endTime' |
'venue' |
'city' |
'capacity' |
'budget' |
'categories' |
'collaborators' |
'tierName' |
'tierPrice' |
'tierQuantity';

export interface StepProps {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
  errors: Partial<Record<WizardField, string>>;
}