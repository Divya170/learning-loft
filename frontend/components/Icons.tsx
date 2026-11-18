import type { ReactNode, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, strokeWidth = 2, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Arrow = (p: P) => <Svg size={18} strokeWidth={2.2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const ArrowLeft = (p: P) => <Svg size={18} strokeWidth={2.2} {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
export const Chevron = (p: P) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
export const Phone = (p: P) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </Svg>
);
export const Pin = (p: P) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const Mail = (p: P) => <Svg {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></Svg>;
export const Close = (p: P) => <Svg strokeWidth={2.2} {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const Menu = (p: P) => <Svg size={22} strokeWidth={2.2} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Svg>;
export const Check = (p: P) => <Svg strokeWidth={3} {...p}><path d="M5 12l5 5 9-10" /></Svg>;
export const Alert = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16h.01" /></Svg>;
export const Search = (p: P) => <Svg strokeWidth={2.2} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const Clock = (p: P) => <Svg size={16} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const Person = (p: P) => <Svg size={16} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>;
export const Trend = (p: P) => <Svg size={16} {...p}><path d="M3 17l6-6 4 4 8-8" /></Svg>;
export const Globe = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></Svg>;
export const Brush = (p: P) => <Svg {...p}><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><circle cx="11" cy="11" r="2" /></Svg>;
export const Calendar = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Svg>;
export const Doc = (p: P) => <Svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></Svg>;
export const Book = (p: P) => <Svg {...p}><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></Svg>;
export const Target = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Svg>;
export const Sprout = (p: P) => <Svg {...p}><path d="M7 20h10M12 20V10M12 10c0-4 3-6 7-6 0 4-3 6-7 6zM12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" /></Svg>;
export const Home = (p: P) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5V21H3z" /><path d="M9 21v-6h6v6" /></Svg>;
export const Grid = (p: P) => <Svg {...p}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></Svg>;
export const Map = (p: P) => <Svg {...p}><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" /></Svg>;
export const Users = (p: P) => <Svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></Svg>;
export const Rising = (p: P) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M14 7h7v7" /></Svg>;
export const Plus = (p: P) => <Svg size={18} strokeWidth={2.4} {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const Play = (p: P) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M7 4l13 8-13 8z" /></svg>
);
export const Pause = (p: P) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);
export const Quote = ({ size = 44, color = 'var(--lav-d)' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M7 7h4v4c0 3-1.5 5-4 6l-.8-1.4C7.6 14.8 8.3 13.7 8.4 12H7zM14 7h4v4c0 3-1.5 5-4 6l-.8-1.4c1.4-.8 2.1-1.9 2.2-3.6H14z" />
  </svg>
);

export const LogoMark = ({ size = 46 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true">
    <rect width="46" height="46" rx="13" fill="#3F6E9E" />
    <path d="M10 22.5 23 11.5l13 11" fill="none" stroke="#F8D979" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 27.5q5.5-2.6 11 1 5.5-3.6 11-1v8.2q-5.5-2.2-11 1.2-5.5-3.4-11-1.2z" fill="#fff" />
    <path d="M23 28.5v8.2" stroke="#3F6E9E" strokeWidth="1.6" />
  </svg>
);
