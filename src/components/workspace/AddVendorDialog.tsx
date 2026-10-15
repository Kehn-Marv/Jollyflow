import React, { useEffect, useState } from 'react';
import type { Vendor, VendorCategory } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { CITIES, VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { inputClass } from '../../utils/styles';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (vendor: Vendor) => void;
}

export function AddVendorDialog({ open, onOpenChange, onCreated }: Props) {
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('decor');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('Lagos');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');setContact('');setDescription('');setError('');
    }
  }, [open]);

  async function save() {
    if (name.trim().length < 2) return setError('Enter the vendor’s business name.');
    const v = await run(() => service.addManualVendor({ name, category, contact, city, description }), { success: `${name.trim()} added to your vendors` });
    if (v) {
      onOpenChange(false);
      onCreated(v);
    }
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add a vendor you already use" description="Recorded privately for your events. They don’t need a JolliFlow account." submitLabel="Add vendor & book" pending={pending} onSubmit={save}>
      <FormField label="Business name" htmlFor="mv-name" error={error}>
        <Input {...fieldA11y('mv-name', error)} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Service type" htmlFor="mv-cat">
          <NativeSelect id="mv-cat" value={category} onChange={(e) => setCategory(e.target.value as VendorCategory)}>
            {(Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).map((c) => <option key={c} value={c}>{VENDOR_CATEGORY_LABELS[c]}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="City" htmlFor="mv-city">
          <NativeSelect id="mv-city" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
        </FormField>
      </div>
      <FormField label="Phone or email" htmlFor="mv-contact" optional>
        <Input id="mv-contact" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label="Notes" htmlFor="mv-desc" optional>
        <Input id="mv-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What they provide" className={inputClass} />
      </FormField>
    </FormDialog>);

}