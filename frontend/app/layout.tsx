import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import '../styles/pages.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['italic'], weight: ['400', '500'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'The Learning Loft — Education Center in Oxnard, CA', template: '%s — The Learning Loft' },
  description:
    'The Learning Loft is a welcoming education center in Oxnard, California. Explore programs, meet our instructors and start an enrollment inquiry.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#3F6E9E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
