import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { load } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { data: site } = await load<SiteSettings>('/site');
  return (
    <div className="site">
      <a className="skip" href="#main">Skip to main content</a>
      <Header site={site} />
      <main id="main">{children}</main>
      <Footer site={site} />
    </div>
  );
}
