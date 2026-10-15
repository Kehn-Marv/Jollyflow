import React from 'react';
import { FormDialog } from './FormDialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, title, message, confirmLabel, pending, destructive = true, onConfirm }: ConfirmDialogProps) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={title} submitLabel={confirmLabel} pending={pending} destructive={destructive} onSubmit={onConfirm}>
      <p className="text-sm leading-relaxed text-smoke">{message}</p>
    </FormDialog>);

}