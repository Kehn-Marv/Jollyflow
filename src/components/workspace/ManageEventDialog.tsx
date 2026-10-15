import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, ArchiveRestore, Ban, FileClock, Rocket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, EventStatus } from '../../types/domain';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { cx } from '../../utils/styles';

interface Props {
  event: EventRecord;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type Confirm = 'cancel' | 'delete' | null;

export function ManageEventDialog({ event, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { pending, run } = useAsyncAction();
  const [confirm, setConfirm] = useState<Confirm>(null);

  async function setStatus(status: EventStatus, msg: string) {
    const ok = await run(() => service.setEventStatus(event.id, status), { success: msg });
    if (ok) {
      onOpenChange(false);
      setConfirm(null);
    }
  }

  const actions = [
  event.status === 'draft' && { key: 'publish', icon: Rocket, title: 'Publish event', body: 'Make the public page and RSVP link live.', onClick: () => setStatus('published', 'Event published') },
  event.status === 'published' && { key: 'draft', icon: FileClock, title: 'Move back to draft', body: 'Hide the public page while you make changes.', onClick: () => setStatus('draft', 'Moved to draft') },
  event.status !== 'archived' && { key: 'archive', icon: Archive, title: 'Archive', body: 'Hide from your dashboard. You can restore it later.', onClick: () => setStatus('archived', 'Event archived') },
  (event.status === 'archived' || event.status === 'cancelled') && { key: 'restore', icon: ArchiveRestore, title: 'Restore as draft', body: 'Bring it back to your active events.', onClick: () => setStatus('draft', 'Event restored as draft') },
  event.status !== 'cancelled' && { key: 'cancel', icon: Ban, title: 'Cancel event', body: 'Guests will see a cancellation notice.', danger: true, onClick: () => setConfirm('cancel') },
  { key: 'delete', icon: Trash2, title: 'Delete permanently', body: 'Removes the event and all its records from this demo.', danger: true, onClick: () => setConfirm('delete') }].
  filter(Boolean) as Array<{key: string;icon: typeof Rocket;title: string;body: string;danger?: boolean;onClick: () => void;}>;

  return (
    <>
      <Dialog open={open && !confirm} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl border-2 border-ink bg-white sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Manage event</DialogTitle>
            <DialogDescription>Change the status of “{event.title}”.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-1">
            {actions.map(({ key, icon: Icon, title, body, danger, onClick }) =>
            <li key={key}>
                <button type="button" disabled={pending} onClick={onClick} className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-sand disabled:opacity-50">
                  <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', danger ? 'text-danger' : 'text-ink')} aria-hidden="true" />
                  <span><span className={cx('block font-semibold', danger ? 'text-danger' : 'text-ink')}>{title}</span><span className="text-sm text-smoke">{body}</span></span>
                </button>
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm === 'cancel'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Cancel this event?"
        message="The public page will show that the event is cancelled and RSVPs and ticket sales will close. Existing records are kept."
        confirmLabel="Cancel event"
        pending={pending}
        onConfirm={() => setStatus('cancelled', 'Event cancelled')} />
      
      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete permanently?"
        message={`This removes “${event.title}” with its guests, tasks, bookings, budget, gifts, tickets and memories from this demo. This can’t be undone (except by resetting all demo data).`}
        confirmLabel="Delete event"
        pending={pending}
        onConfirm={async () => {
          const ok = await run(() => service.deleteEvent(event.id).then(() => true));
          if (ok) {
            toast.success('Event deleted');
            navigate('/app/events', { replace: true });
          }
        }} />
      
    </>);

}