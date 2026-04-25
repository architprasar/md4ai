import React from 'react';

export function SiteBackdrop({ height = 520 }: { height?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '0 0 auto',
        height,
        pointerEvents: 'none',
        background: [
          'radial-gradient(circle at 12% 14%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 26%)',
          'radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 26%)',
          'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--bg)) 0%, transparent 100%)',
        ].join(', '),
      }}
    />
  );
}
