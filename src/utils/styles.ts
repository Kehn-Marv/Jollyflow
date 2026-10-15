import { twMerge } from 'tailwind-merge';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

/** Shared brand class recipes applied to the design-system Button and to Links. */
export const btn = {
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink disabled:opacity-50 disabled:pointer-events-none select-none',
  lime: 'bg-lime text-ink border-2 border-ink shadow-pop-sm hover:-translate-y-px hover:shadow-pop hover:bg-lime active:translate-y-0 active:shadow-none',
  ink: 'bg-ink text-paper border-2 border-ink hover:bg-ink/85',
  outline: 'bg-white text-ink border-2 border-ink hover:bg-sand',
  soft: 'bg-sand text-ink border-2 border-transparent hover:bg-line',
  ghost: 'bg-transparent text-ink border-2 border-transparent hover:bg-sand',
  onDark: 'bg-transparent text-paper border-2 border-paper/30 hover:border-paper hover:bg-white/5',
  danger: 'bg-danger text-white border-2 border-danger hover:bg-danger/90',
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0'
};

export const surface = {
  card: 'rounded-2xl border border-line bg-white',
  pop: 'rounded-2xl border-2 border-ink bg-white shadow-pop',
  dark: 'rounded-2xl bg-ink text-paper'
};

export const inputClass =
'h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-ink placeholder:text-smoke/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 disabled:opacity-60';