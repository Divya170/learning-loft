import type { Metadata } from 'next';
import Link from 'next/link';
import { Crumbs, ErrorState, Frame } from '@/components/ui';
import { load } from '@/lib/api';
import type { Facet, LoftEvent } from '@/lib/types';
import EventsBrowser from './EventsBrowser';

export const metadata: Metadata = { title: 'Events', description: 'Workshops, learning activities and announcements at The Learning Loft.' };

export default async function EventsPage() {
  const [events, categories] = await Promise.all([load<LoftEvent[]>('/events?when=upcoming'), load<Facet[]>('/events/categories?when=upcoming')]);

  return (
    <>
      <section className="phero lav" aria-labelledby="ev-h">
        <div className="dots" style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', opacity: 0.5 }} />
        <div className="wrap split-75" style={{ position: 'relative', paddingBlock: 'clamp(40px,6vw,88px)' }}>
          <div className="stack" style={{ gap: 24 }}>
            <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Events' }]} />
            <h1 id="ev-h" className="h1 rv d1">
              Discover What&apos;s Happening at <span className="serif" style={{ fontWeight: 400, color: 'var(--lav-d)' }}>The Learning Loft.</span>
            </h1>
            <p className="lead rv d2">Workshops, learning activities and announcements for students and families.</p>
          </div>
          <Frame src="/art/art-calendar.svg" alt="Illustration: a calendar with a highlighted date" tone="f-white" kenBurns priority className="rv d2" style={{ aspectRatio: '1', borderRadius: '50% 50% 28px 50%', border: 0 }} />
        </div>
      </section>

      <section className="sec" aria-labelledby="up-h">
        <div className="wrap">
          {events.error || categories.error ? (
            <ErrorState message="Events couldn’t be loaded right now. Please refresh or try again shortly." />
          ) : (
            <EventsBrowser initialEvents={events.data!} initialCategories={categories.data!} />
          )}
        </div>
      </section>

      <section aria-labelledby="ecta-h" style={{ padding: '0 clamp(12px,2vw,24px) clamp(24px,3vw,40px)' }}>
        <div className="between" style={{ background: 'var(--ink)', color: '#fff', borderRadius: 'clamp(24px,3vw,40px)', padding: 'clamp(36px,5vw,72px)', alignItems: 'center' }}>
          <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
            <h2 id="ecta-h" className="h2" style={{ color: '#fff' }}>Questions about an event?</h2>
            <p style={{ color: '#C8D3DE' }}>Ask our team about upcoming workshops, activities and announcements.</p>
          </div>
          <Link className="btn btn-accent" href="/contact?topic=Events#form">Contact Us About Events</Link>
        </div>
      </section>
    </>
  );
}
