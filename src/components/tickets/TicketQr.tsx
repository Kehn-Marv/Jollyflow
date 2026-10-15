import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/** QR encodes exactly the ticket code that the check-in flow validates. */
export function TicketQr({ code, size = 128 }: {code: string;size?: number;}) {
  return (
    <figure className="inline-flex flex-col items-center gap-2">
      <div className="rounded-xl border-2 border-ink bg-white p-2">
        <QRCodeSVG value={code} size={size} level="M" bgColor="#FFFFFF" fgColor="#10110F" title={`Ticket code ${code}`} />
      </div>
      <figcaption className="font-mono text-sm font-semibold tracking-wider text-ink">{code}</figcaption>
    </figure>);

}