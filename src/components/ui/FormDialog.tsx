import React from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { btn, cx } from '../../utils/styles';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  pending?: boolean;
  onSubmit: () => void;
  destructive?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}

export function FormDialog({ open, onOpenChange, title, description, submitLabel, pending, onSubmit, destructive, wide, children }: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className={cx('scroll-thin max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl border-2 border-ink bg-white p-0', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!pending) onSubmit();
          }}>
          
          <DialogHeader className="border-b border-line px-6 pb-4 pt-6 text-left">
            <DialogTitle className="font-display text-xl font-semibold">{title}</DialogTitle>
            {description && <DialogDescription className="text-smoke">{description}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">{children}</div>
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-paper px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" className={cx(btn.base, btn.ghost, btn.md)} onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" className={cx(btn.base, destructive ? btn.danger : btn.ink, btn.md)} disabled={pending} aria-busy={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

}