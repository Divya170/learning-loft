import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { LogoMark } from './Icons';

export default function Footer({ site }: { site: SiteSettings | null }) {
  const name = site?.name ?? 'The Learning Loft';
  return (
    <footer className="ftr">
      <div className="blob" style={{ width: 420, height: 420, right: -140, top: -180, background: 'var(--lav)', opacity: 0.7 }} />
      <div className="wrap" style={{ position: 'relative', paddingTop: 'clamp(64px,7vw,96px)' }}>
        <div className="between" style={{ paddingBottom: 56, borderBottom: '1px solid #EADFC6', alignItems: 'center' }}>
          <p className="statement" style={{ maxWidth: 760 }}>
            Where curiosity grows and <span style={{ color: 'var(--blue-d)' }}>learning takes flight.</span>
          </p>
          <Link className="btn btn-primary" href="/admissions#inquiry">
            Start Your Enrollment Inquiry
          </Link>
        </div>
        <div className="ftr-grid" style={{ paddingBlock: 56 }}>
          <div className="stack" style={{ gap: 18 }}>
            <Link className="logo" href="/" aria-label={`${name} — home`}>
              <LogoMark />
              <span>
                <b>{name}</b>
                <small>Education Center</small>
              </span>
            </Link>
            <p className="small muted" style={{ maxWidth: '34ch' }}>
              A welcoming education center in Oxnard, California, where students explore their potential and build confidence.
            </p>
          </div>
          <nav aria-label="Footer — explore">
            <h2>Explore</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/instructors">Our Instructors</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <nav aria-label="Footer — families">
            <h2>For families</h2>
            <ul>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/admissions">Admissions</Link></li>
              <li><Link href="/resources">Learning Resources</Link></li>
              <li><Link href="/events">Events</Link></li>
            </ul>
          </nav>
          <div>
            <h2>Visit &amp; contact</h2>
            {site ? (
              <address className="stack" style={{ fontStyle: 'normal', gap: 4 }}>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>
                  {site.street}, {site.city}, {site.country}
                </a>
                <a href={`tel:${site.phoneHref}`} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}>
                  {site.phone}
                </a>
                <a href={`mailto:${site.email}`} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', overflowWrap: 'anywhere' }}>
                  {site.email}
                </a>
              </address>
            ) : (
              <p className="small muted">Contact details are temporarily unavailable.</p>
            )}
          </div>
        </div>
        <div className="between xs muted" style={{ paddingBlock: '24px 32px', borderTop: '1px solid #EADFC6', alignItems: 'center' }}>
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          {site?.privacyUrl ? <a href={site.privacyUrl}>Privacy policy</a> : <p>Social links appear here once official accounts are provided.</p>}
        </div>
      </div>
    </footer>
  );
}
