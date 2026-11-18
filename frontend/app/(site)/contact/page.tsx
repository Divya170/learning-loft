import type { Metadata } from 'next';
import { Arrow, Mail, Phone, Pin } from '@/components/Icons';
import { Crumbs, ErrorState } from '@/components/ui';
import { load } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';
import ContactForm from './ContactForm';

export const metadata: Metadata = { title: 'Contact', description: 'Call, email or message The Learning Loft in Oxnard, California.' };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const topic = (Array.isArray(sp.topic) ? sp.topic[0] : sp.topic) ?? '';
  const { data: s, error } = await load<SiteSettings>('/site');
  const embed = s ? `https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery || `${s.street}, ${s.city}`)}&z=15&output=embed` : '';

  return (
    <>
      <section aria-labelledby="ct-h" style={{ background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div className="blob" style={{ width: 520, height: 520, right: -160, top: -220, background: 'var(--sky)' }} />
        <div className="wrap stack" style={{ position: 'relative', gap: 'clamp(40px,5vw,64px)', paddingBlock: 'clamp(40px,6vw,88px)' }}>
          <div className="stack" style={{ gap: 22, maxWidth: 820 }}>
            <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
            <h1 id="ct-h" className="display rv d1" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)' }}>
              We&apos;d Love to <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Hear From You.</span>
            </h1>
            <p className="lead rv d2">Have a question about programs, enrollment or upcoming activities? Call, email or send us a message — our team is happy to help.</p>
          </div>
          {error || !s ? (
            <ErrorState message="Contact details couldn’t be loaded right now. Please refresh the page." />
          ) : (
            <div className="cols-3 rv d3">
              <a className="ccard" href={`tel:${s.phoneHref}`} style={{ background: '#fff' }}>
                <span className="ibadge" style={{ background: '#FCEBB5', color: 'var(--ink)' }}><Phone size={24} /></span>
                <span className="xs muted" style={{ fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Phone</span>
                <span className="h3">{s.phone}</span>
                <span className="go">Call the center <Arrow size={16} /></span>
              </a>
              <a className="ccard" href={`mailto:${s.email}`} style={{ background: '#fff' }}>
                <span className="ibadge" style={{ background: 'var(--lav)', color: 'var(--lav-d)' }}><Mail size={24} /></span>
                <span className="xs muted" style={{ fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Email</span>
                <span className="h3" style={{ overflowWrap: 'anywhere' }}>{s.email}</span>
                <span className="go">Send an email <Arrow size={16} /></span>
              </a>
              <a className="ccard" href="#map" style={{ background: 'var(--blue-dd)', color: '#fff' }}>
                <span className="ibadge" style={{ background: 'rgba(255,255,255,.14)', color: 'var(--yellow)' }}><Pin size={24} /></span>
                <span className="xs" style={{ fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C8D8EA' }}>Address</span>
                <span className="h3" style={{ color: '#fff' }}>{s.street}, {s.city}, {s.country}</span>
                <span className="go" style={{ color: 'var(--yellow)' }}>View location <Arrow size={16} /></span>
              </a>
            </div>
          )}
        </div>
      </section>

      {s && (
        <section id="map" className="sec-s" aria-labelledby="mp-h" style={{ scrollMarginTop: 80 }}>
          <div className="wrap stack" style={{ gap: 28 }}>
            <h2 id="mp-h" className="h2">Find us in Oxnard</h2>
            <div className="mapgrid">
              <div className="mapframe">
                <iframe title={`Map showing ${s.street}, ${s.city}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
              <div className="stack" style={{ gap: 18, padding: 'clamp(24px,3vw,40px)', background: '#fff', justifyContent: 'center' }}>
                <span className="tag">Location</span>
                <p className="h3">{s.name}</p>
                <address style={{ fontStyle: 'normal' }} className="muted">{s.street}<br />{s.city}<br />{s.country}</address>
                <a className="btn btn-primary" href={s.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions</a>
                <a className="link-arrow" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                {s.hours ? <p className="small"><b>Hours:</b> {s.hours}</p> : <p className="xs muted">Opening hours will be listed once confirmed by the center.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="form" className="sec" aria-labelledby="cf-h" style={{ scrollMarginTop: 80 }}>
        <div className="wrap fgrid">
          <div className="stack sticky" style={{ gap: 20 }}>
            <p className="eyebrow">Send a message</p>
            <h2 id="cf-h" className="h2">Ask us <span className="serif" style={{ fontWeight: 400 }}>anything.</span></h2>
            <p className="muted">
              Questions about programs, instructors, events or how enrollment works. For enrollment specifically, the <a href="/admissions#inquiry">enrollment inquiry form</a> collects everything our team needs.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/art-together.svg" alt="" width={360} height={270} loading="lazy" className="hide-md" style={{ width: '100%', maxWidth: 360 }} />
          </div>
          <div className="card" style={{ padding: 'clamp(24px,4vw,48px)', borderRadius: 28, boxShadow: 'var(--sh)' }}>
            <ContactForm initialTopic={topic} privacyUrl={s?.privacyUrl ?? ''} />
          </div>
        </div>
      </section>

      {s && (
        <section className="sec-s" aria-labelledby="co-h" style={{ background: 'var(--sky)' }}>
          <div className="wrap stack" style={{ gap: 28 }}>
            <h2 id="co-h" className="h3">Other ways to reach us</h2>
            <div className="cols-4">
              <a className="btn btn-secondary" href={`mailto:${s.email}`}>Send an Email</a>
              <a className="btn btn-secondary" href={`tel:${s.phoneHref}`}>Call the Center</a>
              <a className="btn btn-secondary" href="#form">Submit an Inquiry</a>
              <a className="btn btn-secondary" href="#map">View the Location</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
