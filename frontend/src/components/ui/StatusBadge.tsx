import React from 'react';

type Status = 'pending' | 'booked' | 'matched' | 'confirmed' | 'cancelled' | 'completed';

export function StatusBadge({ status }: { status: Status | string }) {
  let bg = 'bg-surface-variant';
  let text = 'text-on-surface';

  switch (status.toLowerCase()) {
    case 'pending':
      bg = 'bg-pending-amber/20';
      text = 'text-pending-amber';
      break;
    case 'booked':
    case 'confirmed':
    case 'completed':
      bg = 'bg-booked-emerald/20';
      text = 'text-booked-emerald';
      break;
    case 'matched':
      bg = 'bg-matched-blue/20';
      text = 'text-matched-blue';
      break;
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-label-caps font-bold uppercase tracking-wider ${bg} ${text}`}>
      {status}
    </span>
  );
}
