import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@/components/Icons';
import { Crumbs, ErrorState, Frame, Ph } from '@/components/ui';
import { load } from '@/lib/api';
import { formatDate, formatTime, isBracketed, tagClass, toneClass } from '@/lib/format';
import type { LoftEvent, SiteSettings } from '@/lib/types';

type Params = Promise<{ slug: string }>;
type Data = { event: LoftEvent; isPast: boolean };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await load<Data>(`/events/${encodeURIComponent(slug)}`);
  return { title: data?.event.title ?? 'Events' };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [res, site] = await Promise.all([load<Data>(`/events/${encodeURIComponent(slug)}`), load<SiteSettings>('/site')]);
  if (res.error?.status === 404) notFound();
  if (!res.data) {
    return (
      <div className="wrap sec">
        <ErrorState message="This event couldn’t be loaded right now." action={<Link className="link-arrow" href="/events">All events</Link>} />
      </div>
    );
  }
  const { event: e, isPast } = res.data;

  return (
    <article aria-labelledby="ed-h">
      <Frame src={e.banner} alt="" tone={toneClass(e.tone)} kenBurns priority style={{ borderRadius: 0, height: 'clamp(220px,32vw,420px)' }} caption={e.isPlaceholder ? 'Event banner' : undefined} />
      <div className="wrap-n stack" style={{ gap: 24, paddingBlock: 'clamp(36px,5vw,64px)' }}>
        <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: e.title }]} />
        <div className="row" style={{ gap: 8 }}>
          {e.category && <span className={`tag ${tagClass(e.tone)}`}>{e.category}</span>}
          {isPast && <span className="tag" style={{ background: '#EEF2F6', color: 'var(--slate)' }}>Past event</span>}
          {e.isPlaceholder && <Ph>Placeholder event</Ph>}
        </div>
        <h1 id="ed-h" className="h1" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)' }}>{e.title}</h1>
        <dl className="cols-3" style={{ margin: 0, gap: 14 }}>
          <div className="card" style={{ padding: 18, background: 'var(--sky)', border: 0 }}>
            <dt className="xs muted" style={{ fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Date</dt>
            <dd style={{ margin: '6px 0 0', fontWeight: 600 }}>{formatDate(e.startAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</dd>
          </div>
          <div className="card" style={{ padding: 18, background: 'var(--lav)', border: 0 }}>
            <dt className="xs muted" style={{ fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Time</dt>
            <dd style={{ margin: '6px 0 0', fontWeight: 600 }}>{e.timeLabel || formatTime(e.startAt)}</dd>
          </div>
          <div className="card" style={{ padding: 18, background: 'var(--cream)', border: 0 }}>
            <dt className="xs muted" style={{ fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Location</dt>
            <dd style={{ margin: '6px 0 0', fontWeight: 600 }}>{e.location || (site.data ? `${site.data.street}, ${site.data.city}` : 'To be confirmed')}</dd>
          </div>
        </dl>
        {e.description ? (
          <p className={isBracketed(e.description) ? 'phc' : ''} style={{ fontSize: '1.125rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{e.description}</p>
        ) : (
          <p className="muted">More details coming soon.</p>
        )}
        {/* Registration CTA only when the center supports online registration for this event. */}
        <div className="row stack-sm">
          {e.registrationUrl && !isPast ? (
            <a className="btn btn-primary" href={e.registrationUrl} target="_blank" rel="noopener noreferrer">Register for This Event</a>
          ) : (
            <Link className="btn btn-primary" href="/contact?topic=Events#form">Contact Us About This Event</Link>
          )}
          {site.data && <a className="btn btn-secondary" href={`tel:${site.data.phoneHref}`}>Call the Center</a>}
        </div>
        <Link className="link-arrow" href="/events" style={{ alignSelf: 'flex-start' }}><ArrowLeft />All events</Link>
      </div>
    </article>
  );
}
