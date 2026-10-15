import React, { useId } from 'react';
import { cx } from '../../utils/styles';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Accessible switch row (role="switch"). */
export function ToggleRow({ label, description, checked, onChange, icon, disabled, className }: ToggleRowProps) {
  const id = useId();
  return (
    <div className={cx('flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition', checked ? 'border-ink bg-white' : 'border-line bg-white/60', className)}>
      {icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span id={`${id}-label`} className="block font-semibold text-ink">{label}</span>
        {description && <span id={`${id}-desc`} className="block text-sm text-smoke">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx('relative h-7 w-12 shrink-0 rounded-full border-2 border-ink transition disabled:opacity-50', checked ? 'bg-lime' : 'bg-sand')}>
        
        <span className={cx('absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-white transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>);

}