import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from './Label';
import { cx, inputClass } from '../../utils/styles';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, hint, error, optional, className, children }: FormFieldProps) {
  return (
    <div className={cx('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-smoke">(optional)</span>}
      </Label>
      {children}
      {error ?
      <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p> :
      hint ?
      <p id={`${htmlFor}-hint`} className="text-xs text-smoke">
          {hint}
        </p> :
      null}
    </div>);

}

/** Accessibility props linking an input to its error/hint text. */
export function fieldA11y(id: string, error?: string, hint?: string) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined
  } as const;
}

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export function NativeSelect({ className, children, ...props }: NativeSelectProps) {
  return (
    <div className="relative">
      <select {...props} className={cx(inputClass, 'appearance-none pr-10', className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
    </div>);

}

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

export function MoneyInput({ className, ...props }: MoneyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-smoke" aria-hidden="true">
        ₦
      </span>
      <input {...props} type="text" inputMode="decimal" autoComplete="off" className={cx(inputClass, 'pl-8 tabular-nums', className)} />
    </div>);

}