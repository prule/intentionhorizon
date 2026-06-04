/* ───────────────────────────────────────────────
   Icon.tsx — simple stroke icon set
   ─────────────────────────────────────────────── */
import type { FC, SVGProps } from 'react';

type IconFn = FC<SVGProps<SVGSVGElement>>;

export const Icon: Record<string, IconFn> = {
  entry: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.4 12.1l2.5 2.5 4.6-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  analytics: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="4" y="13" width="4" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10" y="8" width="4" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  settings: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 8h14M5 16h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="8" r="2.4" fill="var(--bg)" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15" cy="16" r="2.4" fill="var(--bg)" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  chevL: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  chevR: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  plus: (p) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  close: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.2 4.3L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  trash: (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  download: (p) => (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  grip: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="6" r="1.5" fill="currentColor" /><circle cx="15" cy="6" r="1.5" fill="currentColor" /><circle cx="9" cy="12" r="1.5" fill="currentColor" /><circle cx="15" cy="12" r="1.5" fill="currentColor" /><circle cx="9" cy="18" r="1.5" fill="currentColor" /><circle cx="15" cy="18" r="1.5" fill="currentColor" /></svg>),
  flame: (p) => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3c.5 3-2 4.2-2 6.8 0 1 .6 1.8 1.4 1.8 1.2 0 1.6-1.2 1.3-2.6 1.7 1 2.8 2.9 2.8 5.1A5.5 5.5 0 016 14.4c0-2 1-3.4 2.2-4.7C10 7.8 11.8 6 12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>),
  help: (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M9.4 9.4c0-1.5 1.2-2.4 2.6-2.4s2.5.9 2.5 2.3c0 1.9-2.4 2-2.4 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="12" cy="16.6" r="1.05" fill="currentColor" /></svg>),
  arrowUp: (p) => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 19V6m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>),
};
