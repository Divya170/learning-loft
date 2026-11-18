import type { Metadata } from 'next';
import Link from 'next/link';
import { Crumbs, ErrorState, Frame } from '@/components/ui';
import { load, qs } from '@/lib/api';
import type { Program, ProgramFacets } from '@/lib/types';
import ProgramBrowser from './ProgramBrowser';

export const metadata: Metadata = { title: 'Programs', description: 'Browse the learning programs offered at The Learning Loft in Oxnard, CA.' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function ProgramsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const initial = { category: one(sp.category), ageGroup: one(sp.ageGroup), level: one(sp.level) };
  const [list, facets] = await Promise.all([load<Program[]>(`/programs${qs(initial)}`), load<ProgramFacets>('/programs/facets')]);

  return (
    <>
      <section className="phero" aria-labelledby="ph-h">
        <div className="blob" style={{ width: 560, height: 560, left: -220, bottom: -320, background: '#fff', opacity: 0.6 }} />
        <div className="wrap split-75" style={{ position: 'relative', paddingBlock: 'clamp(40px,6vw,88px)' }}>
          <div className="stack" style={{ gap: 26 }}>
            <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Programs' }]} />
            <h1 id="ph-h" className="h1 rv d1">Find the Right <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Learning Path.</span></h1>
            <p className="lead rv d2">Browse the programs offered at The Learning Loft, compare what each one covers, and send an inquiry about the one that fits your student best.</p>
            <div className="row stack-sm rv d3">
              <a className="btn btn-primary" href="#browse">Browse Programs</a>
              <Link className="btn btn-secondary" href="/admissions#inquiry">Start Your Enrollment Inquiry</Link>
            </div>
          </div>
          <div className="rv d2" style={{ position: 'relative' }}>
            <Frame src="/art/art-explore.svg" alt="Illustration: a globe and telescope representing exploration" tone="f-cream" kenBurns priority style={{ aspectRatio: '1', borderRadius: '50% 50% 28px 28px / 42% 42% 28px 28px' }} />
            <div className="float" aria-hidden="true" style={{ position: 'absolute', left: -18, bottom: '16%', width: 58, height: 58, borderRadius: 16, background: 'var(--yellow)', transform: 'rotate(-10deg)' }} />
          </div>
        </div>
      </section>

      <section id="browse" className="sec" aria-labelledby="br-h" style={{ scrollMarginTop: 90 }}>
        <div className="wrap">
          {list.error || facets.error ? (
            <ErrorState message="Programs couldn’t be loaded right now. Please refresh the page or try again in a moment." action={<Link className="link-arrow" href="/programs">Try again</Link>} />
          ) : (
            <ProgramBrowser initialPrograms={list.data!} facets={facets.data!} initialFilters={initial} initialView={one(sp.view)} />
          )}
        </div>
      </section>

      <section className="sec-s" aria-labelledby="pc-h" style={{ background: 'var(--lav)' }}>
        <div className="wrap between" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ gap: 12, maxWidth: 640 }}>
            <h2 id="pc-h" className="h2">Not sure which path fits?</h2>
            <p className="lead">Tell us a little about your student in an enrollment inquiry and our team will help you choose.</p>
          </div>
          <div className="row stack-sm">
            <Link className="btn btn-primary" href="/admissions#inquiry">Start Your Enrollment Inquiry</Link>
            <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
