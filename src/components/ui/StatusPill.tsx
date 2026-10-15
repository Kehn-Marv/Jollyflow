import React from "react";
import { BookingStatus, PaymentStatus, RsvpStatus, TaskStatus } from "../../types/domain";
import { cx } from "../../utils/styles";
import { BoxIcon } from "lucide-react";
export type PillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lime' | 'dark' | 'pink';
const TONES: Record<PillTone, string> = {
  neutral: 'bg-sand text-ink',
  success: 'bg-[#E1F1DE] text-ok',
  warning: 'bg-[#FFE7DF] text-[#9C3418]',
  danger: 'bg-[#FADBD4] text-danger',
  info: 'bg-[#DCF2FA] text-[#0D5A73]',
  lime: 'bg-lime text-ink',
  dark: 'bg-ink text-paper',
  pink: 'bg-[#FCE1F5] text-[#7F1A66]'
};
interface StatusPillProps {
  tone?: PillTone;
  icon?: BoxIcon;
  children: React.ReactNode;
  className?: string;
}

/** Status label — always text + colour, never colour alone. */
export function StatusPill({
  tone = 'neutral',
  icon: Icon,
  children,
  className
}: StatusPillProps) {
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>;
}
export const RSVP_TONE: Record<RsvpStatus, PillTone> = {
  attending: 'success',
  pending: 'warning',
  declined: 'neutral'
};
export const RSVP_LABEL: Record<RsvpStatus, string> = {
  attending: 'Attending',
  pending: 'Pending',
  declined: 'Declined'
};
export const PAYMENT_TONE: Record<PaymentStatus, PillTone> = {
  success: 'success',
  pending: 'warning',
  failed: 'danger'
};
export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  success: 'Confirmed',
  pending: 'Pending',
  failed: 'Failed'
};
export const BOOKING_TONE: Record<BookingStatus, PillTone> = {
  confirmed: 'success',
  requested: 'info',
  declined: 'danger',
  cancelled: 'neutral'
};
export const TASK_TONE: Record<TaskStatus, PillTone> = {
  todo: 'neutral',
  in_progress: 'info',
  done: 'success'
};
export const TASK_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done'
};