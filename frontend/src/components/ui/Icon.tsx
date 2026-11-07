import type { CSSProperties } from 'react';

export type IconName =
  | 'ticket'
  | 'panel'
  | 'users'
  | 'arrow'
  | 'check'
  | 'clock'
  | 'heart'
  | 'star'
  | 'consultation'
  | 'exam'
  | 'calendar'
  | 'refresh';

interface IconProps {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}

const paths = {
  ticket: 'M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6V4Zm11 0v3m0 3v4m0 3v3',
  panel: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4M7 8h4m-4 4h7m3-4h.01',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.87a4 4 0 0 1 0 7.75',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  consultation: 'M6 3v5a4 4 0 0 0 8 0V3M4 3h4m4 0h4m-6 9v4a4 4 0 0 0 8 0v-3m2-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  exam: 'm9 3 0 6-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3M7 3h10M7 15h10',
  calendar: 'M8 2v4m8-4v4M3 10h18M3 4h18v17H3V4Zm5 10h2m4 0h2m-8 3h2',
  refresh: 'M20 7v5h-5M4 17v-5h5m-4.3-4a8 8 0 0 1 13.2-3L20 8M4 16l2.1 3a8 8 0 0 0 13.2-3',
};

// Ícones pequenos em SVG local: a interface funciona sem fontes ou imagens externas.
export function Icon({ name, size = 22, style }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
