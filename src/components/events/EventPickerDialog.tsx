import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import type { EventRecord } from '../../types/domain';
import { fmtDate } from '../../utils/dates';

interface EventPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  events: EventRecord[];
  onPick: (event: EventRecord) => void;
}

export function EventPickerDialog({ open, onOpenChange, title, events, onPick }: EventPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>Choose the event this belongs to.</DialogDescription>
        </DialogHeader>
        {events.length ?
        <ul className="-mx-2 max-h-[60vh] space-y-1 overflow-y-auto">
            {events.map((e) =>
          <li key={e.id}>
                <button type="button" onClick={() => onPick(e)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sand">
                  <img src={e.coverUrl} alt="" loading="lazy" decoding="async" className="h-11 w-11 shrink-0 rounded-lg bg-sand object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{e.title}</span>
                    <span className="block text-xs text-smoke">{fmtDate(e.startsAt)} · {e.city}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-smoke" aria-hidden="true" />
                </button>
              </li>
          )}
          </ul> :

        <p className="py-6 text-center text-sm text-smoke">No active events yet. Create one first.</p>
        }
      </DialogContent>
    </Dialog>);

}