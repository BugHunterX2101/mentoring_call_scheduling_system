import React from 'react';

type TagColor = 'blue' | 'green' | 'amber' | 'gray' | 'default';

interface TagPillProps {
  label: string;
  color?: TagColor;
  className?: string;
}

export function TagPill({ label, color = 'default', className = '' }: TagPillProps) {
  const colorStyles = {
    blue: 'bg-badge-blue-bg text-badge-blue-text',
    green: 'bg-badge-green-bg text-badge-green-text',
    amber: 'bg-badge-amber-bg text-badge-amber-text',
    gray: 'bg-badge-gray-bg text-badge-gray-text',
    default: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${colorStyles[color]} ${className}`}>
      {label}
    </span>
  );
}
