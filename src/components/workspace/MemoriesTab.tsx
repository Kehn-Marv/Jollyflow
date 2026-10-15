import React, { useRef, useState } from 'react';
import { ImagePlus, Info, Trash2, Images } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, Memory } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { timeAgo } from '../../utils/dates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

const MAX_BYTES = 10 * 1024 * 1024;

export function MemoriesTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const memories = db.memories.filter((m) => m.eventId === event.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const { pending, run } = useAsyncAction();
  const [preview, setPreview] = useState<Memory | null>(null);
  const [toDelete, setToDelete] = useState<Memory | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} isn’t an image.`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 10 MB.`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    await run(async () => {
      for (const f of valid) {
        await service.addMemory({ eventId: event.id, url: URL.createObjectURL(f), caption: f.name.replace(/\.[^.]+$/, ''), localOnly: true });
      }
      return true;
    }, { success: `${valid.length} photo${valid.length > 1 ? 's' : ''} added as local preview` });
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Memories</h2>
          <p className="text-sm text-smoke">{memories.length} photos</p>
        </div>
        <div>
          <input ref={inputRef} id="memory-upload" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          <Button type="button" disabled={pending} onClick={() => inputRef.current?.click()} className={cx(btn.base, btn.ink, btn.md)}><ImagePlus className="h-4 w-4" aria-hidden="true" /> Add photos</Button>
        </div>
      </div>
      <p className="flex items-start gap-2 rounded-2xl bg-sky/30 p-3 text-sm text-ink" role="note">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Uploads are previewed in your browser only and disappear when you refresh — nothing is uploaded to a server yet. Sample photos persist.
      </p>
      {memories.length ?
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {memories.map((m) =>
        <li key={m.id} className="group relative overflow-hidden rounded-2xl border border-line bg-white">
              <button type="button" onClick={() => setPreview(m)} className="block w-full" aria-label={`Open ${m.caption}`}>
                <img src={m.url} alt={m.caption} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" />
              </button>
              <div className="flex items-center gap-2 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{m.caption}</p>
                  <p className="truncate text-xs text-smoke">{m.uploadedBy} · {timeAgo(m.createdAt)}</p>
                </div>
                <button type="button" onClick={() => setToDelete(m)} aria-label={`Remove ${m.caption}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              {m.localOnly && <StatusPill tone="lime" className="absolute left-2 top-2">Local preview</StatusPill>}
            </li>
        )}
        </ul> :

      <EmptyState icon={Images} title="No photos yet" message="After the event, collect everyone’s favourite moments here." action={<Button type="button" onClick={() => inputRef.current?.click()} className={cx(btn.base, btn.ink, btn.md)}>Add photos</Button>} />
      }

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="rounded-2xl border-2 border-ink bg-white p-3 sm:max-w-3xl">
          <DialogHeader className="px-2 text-left">
            <DialogTitle className="font-display">{preview?.caption}</DialogTitle>
            <DialogDescription>Added by {preview?.uploadedBy}</DialogDescription>
          </DialogHeader>
          {preview && <img src={preview.url} alt={preview.caption} className="max-h-[70vh] w-full rounded-xl object-contain" />}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove photo?"
        message="It will be removed from this event’s gallery."
        confirmLabel="Remove"
        pending={pending}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(() => service.removeMemory(toDelete.id).then(() => true), { success: 'Photo removed' });
          if (ok) setToDelete(null);
        }} />
      
    </div>);

}