import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './Button';
import { copyText, shareLink } from '../../utils/clipboard';
import { btn, cx } from '../../utils/styles';

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedMessage?: string;
  share?: {title: string;};
  variant?: 'outline' | 'ink' | 'lime' | 'soft' | 'onDark';
  size?: 'sm' | 'md';
  className?: string;
  onCopied?: () => void;
}

export function CopyButton({ value, label = 'Copy link', copiedMessage = 'Link copied', share, variant = 'outline', size = 'sm', className, onCopied }: CopyButtonProps) {
  const [done, setDone] = useState(false);

  async function handle() {
    const result = share ? await shareLink(share.title, value) : (await copyText(value)) ? 'copied' : 'failed';
    if (result === 'failed') {
      toast.error('Couldn’t copy automatically. Select and copy the link instead.');
      return;
    }
    if (result === 'copied') toast.success(copiedMessage);
    setDone(true);
    onCopied?.();
    window.setTimeout(() => setDone(false), 1800);
  }

  const Icon = done ? Check : share ? Share2 : Copy;
  return (
    <Button type="button" onClick={handle} className={cx(btn.base, btn[variant], btn[size], className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {done ? 'Done' : label}
    </Button>);

}