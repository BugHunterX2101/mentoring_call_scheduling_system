import React from 'react';

export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-3 py-1 bg-surface-container-high text-text-muted rounded-full text-body-sm whitespace-nowrap">
      {tag}
    </span>
  );
}
