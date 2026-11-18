'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Pin } from '@/components/Icons';
import { ErrorState, Ph } from '@/components/ui';
import { api, ApiError, qs } from '@/lib/api';
import { dateTile, formatTime, isBracketed, tagClass } from '@/lib/format';
import type { Facet, LoftEvent } from '@/lib/types';

type When = 'upcoming' | 'past';
const TILE_BG: Record<string, string> = { sky: 'var(--sky)', lav: 'var(--lav)', cream: 'var(--cream)', yel: '#FCEBB5', white: '#F3F6F9' };

export default function EventsBrowser({ initialEvents, initialCategories }: { initialEvents: LoftEvent[]; initialCategories: Facet[] }) {
  const [when, setWhen] = useState<When>('upcoming');
  const [category, setCategory] = useState('');
  const [events, setEvents] = useState(initialEvents);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      api<LoftEvent[]>(`/events${qs({ when, category })}`, { signal: ctrl.signal }),
      api<Facet[]>(`/events/categories${qs({ when })}`, { signal: ctrl.signal }),
    ])
      .then(([e, c]) => { setEvents(e); setCategories(c); })
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load events.'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [when, category, reload]);

  const switchTab = (w: When) => { setWhen(w); setCategory(''); };
  const totalInTab = categories.reduce((n, c) => n + c.count, 0) || events.length;
  const empty = !loading && events.length === 0;

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div className="between" style={{ alignItems: 'center' }}>
        <h2 id="up-h" className="h2">{when === 'upcoming' ? 'Upcoming events' : 'Past events'}</h2>
        <div className="tabs" role="group" aria-label="Show upcoming or past events">
          <button type="button" aria-pressed={when === 'upcoming'} onClick={() => switchTab('upcoming')}>Upcoming</button>
          <button type="button" aria-pressed={when === 'past'} onClick={() => switchTab('past')}>Past events</button>
        </div>
      </div>

      {/* Category filters only appear when there is real data to filter. */}
      {categories.length > 1 && (
        <div className="chips scroll" role="group" aria-label="Filter by event category">
          <button type="button" className="chip" aria-pressed={!category} onClick={() => setCategory('')}>All <span className="ct">{totalInTab}</span></button>
          {categories.map((c) => (
            <button key={c.value} type="button" className="chip" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>
              {c.value} <span className="ct">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">{loading ? 'Loading events…' : `${events.length} events shown`}</p>

      {error ? (
        <ErrorState message={error} action={<button type="button" className="link-arrow" onClick={() => setReload((n) => n + 1)}>Try again</button>} />
      ) : loading && events.length === 0 ? (
        <div className="stack" style={{ gap: 16 }} aria-hidden="true">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : empty && category ? (
        <div className="state" style={{ border: '1.5px dashed #C3CEDA' }}>
          <h3 className="h3">No events in this category</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCategory('')}>Show all categories</button>
        </div>
      ) : empty ? (
        <div className="split" style={{ background: 'var(--cream)', borderRadius: 28, padding: 'clamp(28px,5vw,64px)', gap: 40 }}>
          <div className="stack" style={{ gap: 18 }}>
            <span className="ibadge" style={{ background: '#FCEBB5', color: 'var(--ink)' }}><Calendar size={24} /></span>
            <h3 className="h2" style={{ fontSize: 'clamp(1.6rem,2.8vw,2.2rem)' }}>{when === 'upcoming' ? 'No upcoming events just yet' : 'No past events to show yet'}</h3>
            <p className="lead">New learning experiences are on the way. Check back for upcoming activities and announcements.</p>
            <div className="row stack-sm">
              <Link className="btn btn-primary" href="/contact?topic=Events#form">Contact Us About Events</Link>
              <Link className="btn btn-secondary" href="/programs">Explore Programs</Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/art-calendar.svg" alt="" width={420} height={315} loading="lazy" style={{ width: '100%', maxWidth: 420, justifySelf: 'center' }} />
        </div>
      ) : (
        <ul className={loading ? 'busy' : ''} style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-busy={loading}>
          {events.map((e) => {
            const d = dateTile(e.startAt);
            return (
              <li key={e.id} className="ev">
                <div className="date" style={{ background: TILE_BG[e.tone] ?? 'var(--sky)' }}>
                  <span className="xs" style={{ fontWeight: 700, letterSpacing: '.1em' }}>{d.mon}</span>
                  <b>{d.day}</b>
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    {e.category && <span className={`tag ${tagClass(e.tone)}`}>{e.category}</span>}
                    {e.isPlaceholder && <Ph>Placeholder event</Ph>}
                  </div>
                  <h3 className="h3">{e.title}</h3>
                  <div className="meta">
                    <span><Clock />{e.timeLabel || formatTime(e.startAt)}</span>
                    {e.location && <span><Pin size={16} />{e.location}</span>}
                  </div>
                  {e.description && <p className={`small ${isBracketed(e.description) ? 'phc' : 'muted'}`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.description}</p>}
                </div>
                <Link className="btn btn-secondary btn-sm" href={`/events/${e.slug}`}>Event details<span className="sr-only">: {e.title}</span></Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
