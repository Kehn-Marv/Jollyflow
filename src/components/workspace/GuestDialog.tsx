import React, { useEffect, useState } from 'react';
import type { EventRecord, Guest, RsvpStatus } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { isContact } from '../../utils/validation';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  guest: Guest | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function GuestDialog({ event, guest, open, onOpenChange }: Props) {
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [group, setGroup] = useState('');
  const [plusOnes, setPlusOnes] = useState('0');
  const [rsvp, setRsvp] = useState<RsvpStatus>('pending');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{name?: string;contact?: string;}>({});

  useEffect(() => {
    if (!open) return;
    setName(guest?.name ?? '');
    setContact(guest?.contact ?? '');
    setGroup(guest?.group ?? '');
    setPlusOnes(String(guest?.plusOnes ?? 0));
    setRsvp(guest?.rsvp ?? 'pending');
    setNote(guest?.note ?? '');
    setErrors({});
  }, [open, guest]);

  async function save() {
    const e = {
      name: name.trim().length < 2 ? 'Enter the guest’s name.' : undefined,
      contact: contact.trim() && !isContact(contact) ? 'Use an email or Nigerian phone number.' : undefined
    };
    setErrors(e);
    if (e.name || e.contact) return;
    const input = { eventId: event.id, name, contact, group: group.trim() || 'Guests', plusOnes: Number(plusOnes) || 0, rsvp, note };
    const ok = await run(() => guest ? service.updateGuest(guest.id, input) : service.addGuest(input), { success: guest ? 'Guest updated' : `${name.trim()} added` });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={guest ? 'Edit guest' : 'Add a guest'} submitLabel={guest ? 'Save guest' : 'Add guest'} pending={pending} onSubmit={save}>
      <FormField label="Name" htmlFor="g-name" error={errors.name}>
        <Input {...fieldA11y('g-name', errors.name)} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
      </FormField>
      <FormField label="Email or phone" htmlFor="g-contact" optional error={errors.contact} hint="Used to match their RSVP if they respond from the public page.">
        <Input {...fieldA11y('g-contact', errors.contact, 'x')} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0803 000 0000 or name@example.com" className={inputClass} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Group" htmlFor="g-group" optional>
          <Input id="g-group" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Family, Work…" className={inputClass} />
        </FormField>
        <FormField label="RSVP" htmlFor="g-rsvp">
          <NativeSelect id="g-rsvp" value={rsvp} onChange={(e) => setRsvp(e.target.value as RsvpStatus)}>
            <option value="pending">Pending</option><option value="attending">Attending</option><option value="declined">Declined</option>
          </NativeSelect>
        </FormField>
        <FormField label="Plus-ones" htmlFor="g-plus">
          <NativeSelect id="g-plus" value={plusOnes} onChange={(e) => setPlusOnes(e.target.value)} disabled={!event.plusOnesAllowed}>
            {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </NativeSelect>
        </FormField>
      </div>
      {!event.plusOnesAllowed && <p className="text-xs text-smoke">Plus-ones are turned off for this event.</p>}
      <FormField label="Note" htmlFor="g-note" optional>
        <Input id="g-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dietary needs, seating…" className={inputClass} />
      </FormField>
    </FormDialog>);

}