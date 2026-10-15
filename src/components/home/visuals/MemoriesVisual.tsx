import React from 'react';
import { useDb } from '../../../contexts/DataContext';
import { cx } from '../../../utils/styles';

const ROT = ['-rotate-3', 'rotate-2', 'rotate-3', '-rotate-2'];

export function MemoriesVisual({ eventId = 'e_naming' }: {eventId?: string;}) {
  const db = useDb();
  const photos = db.memories.filter((m) => m.eventId === eventId && !m.localOnly).slice(0, 4);
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6">
      {photos.map((m, i) =>
      <li key={m.id} className={cx('rounded-2xl border-2 border-ink bg-white p-2 pb-3 shadow-pop', ROT[i % 4])}>
          <img src={m.url} alt={m.caption} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
          <p className="mt-2 truncate px-1 text-xs font-semibold text-ink">{m.caption}</p>
        </li>
      )}
    </ul>);

}