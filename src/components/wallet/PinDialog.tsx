import React, { useEffect, useRef, useState } from 'react';
import { Loader2, LockKeyhole } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => Promise<void>;
}

const LENGTH = 4;

export function PinDialog({ open, onOpenChange, onConfirm }: PinDialogProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    setDigits(Array(LENGTH).fill(''));
    setError('');
    setPending(false);
    window.setTimeout(() => refs.current[0]?.focus(), 50);
  }, [open]);

  const pin = digits.join('');

  function setAt(i: number, value: string) {
    const clean = value.replace(/\D/g, '');
    if (clean.length > 1) {
      const next = clean.slice(0, LENGTH).split('');
      setDigits([...next, ...Array(LENGTH - next.length).fill('')]);
      refs.current[Math.min(next.length, LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError('');
    if (clean && i < LENGTH - 1) refs.current[i + 1]?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== LENGTH) return setError('Enter all 4 digits.');
    setPending(true);
    try {
      await onConfirm(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className="rounded-3xl border border-line bg-white p-0 sm:max-w-sm">
        <form onSubmit={submit} noValidate className="p-7">
          <DialogHeader className="items-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sand"><LockKeyhole className="h-5 w-5 text-ink" aria-hidden="true" /></span>
            <DialogTitle className="mt-3 font-display text-xl font-semibold">Enter PIN to generate</DialogTitle>
            <DialogDescription className="text-smoke">Your PIN is encrypted before it is sent.</DialogDescription>
          </DialogHeader>

          {pending ?
          <div className="flex flex-col items-center gap-3 py-8" role="status" aria-live="polite">
              <Loader2 className="h-7 w-7 animate-spin text-ink" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">Generating…</p>
              <p className="text-xs text-smoke">Creating your ALAT virtual account</p>
            </div> :

          <>
              <fieldset className="mt-7">
                <legend className="sr-only">4-digit PIN</legend>
                <div className="flex justify-center gap-3">
                  {digits.map((d, i) =>
                <input
                  key={i}
                  ref={(el) => refs.current[i] = el}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={LENGTH}
                  value={d}
                  aria-label={`PIN digit ${i + 1}`}
                  aria-invalid={!!error}
                  onChange={(e) => setAt(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
                  }}
                  className={cx(
                    'h-14 w-12 rounded-2xl border bg-paper text-center font-display text-2xl text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10',
                    error ? 'border-danger' : 'border-line'
                  )} />

                )}
                </div>
              </fieldset>
              <p className="mt-3 min-h-[1.25rem] text-center text-sm text-danger" role="alert">{error}</p>
              <Button type="submit" disabled={pin.length !== LENGTH} className={cx(btn.base, btn.ink, btn.md, 'mt-2 w-full')}>Generate account</Button>
              <button type="button" onClick={() => onOpenChange(false)} className="mt-2 w-full rounded-full py-2 text-sm font-medium text-smoke hover:text-ink">Cancel</button>
            </>
          }
        </form>
      </DialogContent>
    </Dialog>);

}