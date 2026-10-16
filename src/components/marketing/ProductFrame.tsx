import React from 'react';
import { cx } from '../../utils/styles';

/** A quiet "device" bezel used to present live product surfaces on dark heroes. */
export function ProductFrame({ children, className, innerClassName }: {children: React.ReactNode;className?: string;innerClassName?: string;}) {
  return (
    <div className={cx('rounded-[30px] border border-white/10 bg-white/[0.04] p-2 sm:p-2.5', className)}>
      <div className={cx('overflow-hidden rounded-[22px] bg-paper text-ink', innerClassName)}>{children}</div>
    </div>);

}