import React from 'react';

const icons = {
  trophy: (
    <>
      <path d="M7 3h10v3h4v3c0 3.3-2.5 6-5.7 6.3A5.2 5.2 0 0 1 13 17v2h3v2H8v-2h3v-2a5.2 5.2 0 0 1-2.3-1.7A6.2 6.2 0 0 1 3 9V6h4V3Z" />
      <path d="M7 7H5v2a3 3 0 0 0 2.2 2.9A8.7 8.7 0 0 1 7 7Zm10 0v4.9A3 3 0 0 0 19 9V7h-2Z" opacity=".7" />
    </>
  ),
  star: <path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8Z" />,
  check: <path d="m5 12.5 4.2 4.2L19.5 6.4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="4" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="5" />
      <path d="M12 12h8m-3 0v4m3-4v2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  plane: <path d="m21 3-7.2 18-3.5-7.3L3 10.2 21 3Zm-10.7 10.7L21 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  pilot: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M3.5 20c1.2-4.3 4-6.5 8.5-6.5s7.3 2.2 8.5 6.5" />
      <path d="M8 7.5c1.7 1 6.3 1 8 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  dice: <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9-9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" fill="none" stroke="var(--bg-0)" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  construction: (
    <>
      <path d="M4 4h16l-2 7H6L4 4Zm2 7h12l2 9H4l2-9Z" />
      <path d="M9 11l-2 9m8-9 2 9" fill="none" stroke="var(--bg-0)" strokeWidth="1.5" />
    </>
  ),
  crown: <path d="m3 7 4 4 5-7 5 7 4-4-2 12H5L3 7Z" />,
  medal: (
    <>
      <circle cx="12" cy="14" r="7" />
      <path d="m8 3 4 7 4-7" fill="none" stroke="var(--gold)" strokeWidth="2" />
      <path d="m12 10 1.5 3 3.3.5-2.4 2.3.6 3.2-2.9-1.5-2.9 1.5.6-3.2-2.4-2.3 3.3-.5L12 10Z" fill="var(--bg-0)" opacity=".65" />
    </>
  ),
  plug: (
    <>
      <path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-6 6v4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="2" fill="var(--bg-0)" />
    </>
  ),
  clouds: <path d="M7 18a5 5 0 0 1-1-9.9A7 7 0 0 1 19.5 10a4 4 0 0 1-1.5 8H7Z" />,
  shuffle: <path d="M3 7h3c5 0 5 10 10 10h5m-3-3 3 3-3 3M3 17h3c2 0 3-2 4-4m3-4c1-1.5 2-2 3-2h5m-3-3 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  pause: <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />,
  play: <path d="m7 4 12 8-12 8V4Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  rain: (
    <>
      <path d="M7 10a5 5 0 0 1 9.7-1.7A4 4 0 0 1 17 16H7a3.5 3.5 0 0 1 0-7Z" />
      <path d="m8 18-1.5 3m5.5-3-1.5 3m5.5-3L14.5 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  snow: (
    <>
      <path d="M12 2v20M3.4 7l17.2 10M3.4 17l17.2-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m12 2-3 3m3-3 3 3m-3 17-3-3m3 3 3-3M3.4 7l4.2-.5m-4.2.5.8 4m16.4 5.5-4.2.5m4.2-.5-.8-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  wind: <path d="M3 8h11.5a2.5 2.5 0 1 0-2.3-3.5M3 12h15a2.5 2.5 0 1 1-2.3 3.5M3 16h7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />,
  fog: (
    <>
      <path d="M4 7h16M2 12h20M5 17h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 3h8M7 21h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".65" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="12" rx="3" />
      <path d="M3 9h18M12 9v12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9C11 6.5 8 7 8 5.5A2.5 2.5 0 0 1 12.5 5.5C12.5 7 12 9 12 9Zm0 0c1-2.5 4-2 4-3.5A2.5 2.5 0 0 0 11.5 5.5C11.5 7 12 9 12 9Z" />
    </>
  ),
  skull: (
    <>
      <path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 5 4 6v4h8v-4c2.5-1 4-3 4-6a8 8 0 0 0-8-8Z" />
      <circle cx="9" cy="11" r="1.5" fill="var(--bg-0)" />
      <circle cx="15" cy="11" r="1.5" fill="var(--bg-0)" />
      <path d="M10 16h4" fill="none" stroke="var(--bg-0)" strokeWidth="1.5" />
    </>
  ),
};

export function ClayIcon({ name, size = 24, className = '', label }) {
  return (
    <svg
      className={`clay-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    >
      {icons[name] || icons.star}
    </svg>
  );
}
