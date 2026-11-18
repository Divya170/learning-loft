import Link from 'next/link';
import HeroRotator from '@/components/HeroRotator';
import { Arrow, Brush, Globe, Mail, Phone, Pin, Quote } from '@/components/Icons';
import { ArrowLink, ErrorState, Frame, Ph, Txt } from '@/components/ui';
import { load } from '@/lib/api';
import { tagClass, toneClass } from '@/lib/format';
import type { Instructor, Program, SiteSettings, Testimonial } from '@/lib/types';

const APPROACH = [
  { n: '01', color: 'var(--blue-d)', title: 'Curiosity-driven learning', text: 'Questions are welcome. Students are encouraged to wonder, explore and follow ideas further.' },
  { n: '02', color: 'var(--lav-d)', title: 'Confidence building', text: 'Small wins add up. Progress is noticed, named and celebrated along the way.' },
  { n: '03', color: '#9A7400', title: 'Supportive guidance', text: 'Instructors meet students where they are and help them take the next step.' },
  { n: '04', color: 'var(--blue-d)', title: 'Personal growth', text: 'Learning reaches beyond the subject — habits, curiosity and self-belief that last.' },
];

const PORTRAIT_LOOKS = [
  { tone: 'f-lav arch', ratio: '4 / 5', radius: undefined, pad: 0 },
  { tone: 'f-sky', ratio: '1', radius: '28px', pad: 'clamp(0px,6vw,80px)' },
  { tone: 'f-yel', ratio: '4 / 5', radius: '28px 28px 140px 28px', pad: 0 },
];

export default async function HomePage() {
  const [site, featured, instructors, testimonials] = await Promise.all([
    load<SiteSettings>('/site'),
    load<Program[]>('/programs?featured=true'),
    load<Instructor[]>('/instructors'),
    load<Testimonial[]>('/testimonials'),
  ]);
  const s = site.data;
  const programs = (featured.data ?? []).slice(0, 4);
  const people = (instructors.data ?? []).slice(0, 3);
  const quotes = testimonials.data ?? [];

  return (
    <>
      {/* A · HERO */}
      <section aria-labelledby="hero-h" style={{ position: 'relative', overflow: 'hidden', background: 'var(--cream)' }}>
        <div className="blob" style={{ width: 720, height: 720, right: -180, top: -200, background: 'var(--sky)' }} />
        <div className="dots" style={{ position: 'absolute', left: 0, bottom: 0, width: 320, height: 220, opacity: 0.6, pointerEvents: 'none' }} />
        <div className="wrap hero-grid" style={{ position: 'relative', paddingTop: 'clamp(48px,7vw,104px)', paddingBottom: 'clamp(64px,8vw,120px)' }}>
          <div className="stack" style={{ gap: 28 }}>
            <p className="eyebrow rv">Education Center · Oxnard, California</p>
            <h1 id="hero-h" className="display rv d1">
              Big Curiosity. <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Brighter</span> <span className="hl">Possibilities.</span>
            </h1>
            <p className="lead rv d2">Discover a welcoming learning environment designed to inspire curiosity, build confidence, and help every student grow.</p>
            <div className="row stack-sm rv d3" style={{ marginTop: 6 }}>
              <Link className="btn btn-primary" href="/admissions#inquiry">Start Your Enrollment <Arrow /></Link>
              <Link className="btn btn-secondary" href="/programs">Explore Our Programs</Link>
            </div>
            {s && (
              <p className="small muted rv d4" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={18} />
                <span>Prefer to talk first? Call <a href={`tel:${s.phoneHref}`} style={{ fontWeight: 600 }}>{s.phone}</a></span>
              </p>
            )}
          </div>
          <HeroRotator street={s?.street} />
        </div>
      </section>

      {/* B · INTRODUCTION */}
      <section className="sec" aria-labelledby="intro-h">
        <div className="wrap split-57">
          <div className="sr" style={{ position: 'relative', padding: '0 12% 14% 0' }}>
            <Frame src="/art/art-grow.svg" alt="Illustration: a seedling growing from an open book" tone="f-lav" zoom style={{ aspectRatio: '4 / 5', borderRadius: '28px 160px 28px 28px' }} caption="Representative illustration — center photography to come" />
            <Frame src="/art/art-together.svg" tone="f-yel" style={{ position: 'absolute', right: 0, bottom: 0, width: '46%', aspectRatio: '1', borderRadius: '50%', border: '8px solid #fff' }} imgStyle={{ padding: '18%' }} />
          </div>
          <div className="stack sr" style={{ gap: 24 }}>
            <p className="eyebrow">Welcome to The Learning Loft</p>
            <h2 id="intro-h" className="h2">A Place Where Every Learner <span className="serif" style={{ fontWeight: 400 }}>Can Grow.</span></h2>
            <p className="lead">
              The Learning Loft is a welcoming educational destination in Oxnard where students can explore their potential, strengthen their knowledge, develop confidence, and enjoy meaningful learning experiences.
            </p>
            <div className="ph-box">
              <Ph />
              <p className="phc small">[The center&apos;s story — when and why The Learning Loft was founded, who it serves, and what makes its approach distinct. To be supplied and approved by Katherine Anderson.]</p>
            </div>
            <ArrowLink href="/about">Learn About Us</ArrowLink>
          </div>
        </div>
      </section>

      {/* C · PROGRAMS PREVIEW */}
      <section className="sec" aria-labelledby="prog-h" style={{ background: 'var(--sky)' }}>
        <div className="wrap stack" style={{ gap: 48 }}>
          <div className="between">
            <div className="stack" style={{ gap: 18, maxWidth: 640 }}>
              <p className="eyebrow">Programs</p>
              <h2 id="prog-h" className="h2">Find a learning path that fits <span className="serif" style={{ fontWeight: 400 }}>your student.</span></h2>
              {programs.some((p) => p.isPlaceholder) && <Ph>Program names, ages &amp; details awaiting client confirmation</Ph>}
            </div>
            <Link className="btn btn-secondary" href="/programs">Explore All Programs</Link>
          </div>
          {featured.error ? (
            <ErrorState message="Programs couldn’t be loaded right now. Please refresh, or browse the Programs page." />
          ) : programs.length === 0 ? (
            <p className="lead">Programs will be listed here soon. In the meantime, <Link href="/contact">ask our team</Link> what&apos;s available.</p>
          ) : (
            <div className="pgrid">
              {programs.map((p, i) => <ProgramTile key={p.id} program={p} variant={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* D · LEARNING APPROACH */}
      <section className="sec" aria-labelledby="appr-h" style={{ background: 'var(--cream)' }}>
        <div className="wrap split-57" style={{ alignItems: 'start' }}>
          <div className="stack sticky" style={{ gap: 22 }}>
            <p className="eyebrow">Our learning approach</p>
            <h2 id="appr-h" className="h2">What we hope every learner <span className="serif" style={{ fontWeight: 400 }}>feels here.</span></h2>
            <p className="lead">Four themes that shape the experience at The Learning Loft.</p>
            <Ph>Proposed themes — pending client confirmation</Ph>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {APPROACH.map((a, i) => (
              <li key={a.n} className="appr sr" style={i === APPROACH.length - 1 ? { borderBottom: '1px solid #EADFC6' } : undefined}>
                <span className="num" style={{ color: a.color }}>{a.n}</span>
                <div className="stack" style={{ gap: 8 }}>
                  <h3 className="h3">{a.title}</h3>
                  <p className="muted">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* E · INSTRUCTOR PREVIEW */}
      <section className="sec" aria-labelledby="inst-h">
        <div className="wrap stack" style={{ gap: 52 }}>
          <div className="between">
            <div className="stack" style={{ gap: 18, maxWidth: 620 }}>
              <p className="eyebrow lav">The people behind the learning</p>
              <h2 id="inst-h" className="h2">Meet the instructors who <span className="serif" style={{ fontWeight: 400 }}>guide every step.</span></h2>
            </div>
            <Link className="btn btn-secondary" href="/instructors">Meet Our Instructors</Link>
          </div>
          {instructors.error ? (
            <ErrorState message="Instructor profiles couldn’t be loaded right now." />
          ) : people.length === 0 ? (
            <p className="lead">Instructor profiles will be introduced here soon.</p>
          ) : (
            <div className="igrid">
              {people.map((p, i) => {
                const look = PORTRAIT_LOOKS[i % PORTRAIT_LOOKS.length];
                return (
                  <article key={p.id} className="stack sr" style={{ gap: 18, paddingTop: look.pad || undefined }}>
                    <Link href={`/instructors?view=${p.slug}`} aria-label={`View profile of ${p.name}`} style={{ display: 'block' }}>
                      <Frame src={p.photo} alt={p.isPlaceholder ? 'Portrait placeholder for an instructor' : `Portrait of ${p.name}`} tone={look.tone} className="portrait" zoom style={{ aspectRatio: look.ratio, borderRadius: look.radius }} caption={p.isPlaceholder ? 'Instructor photo' : undefined} />
                    </Link>
                    <div className="stack" style={{ gap: 6 }}>
                      <h3 className="h3">{p.name}</h3>
                      <Txt className="small" text={p.position} />
                      <Txt className="small muted" text={p.shortBio} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* F · TESTIMONIALS — only rendered when authentic, consented testimonials exist */}
      {quotes.length > 0 && (
        <section className="sec-s" aria-labelledby="tst-h" style={{ background: 'var(--lav)' }}>
          <div className="wrap-n stack" style={{ gap: 32, textAlign: 'center', alignItems: 'center' }}>
            <h2 id="tst-h" className="eyebrow lav">What families say</h2>
            {quotes.slice(0, 2).map((q) => (
              <figure key={q.id} className="stack" style={{ gap: 16, alignItems: 'center', margin: 0 }}>
                <Quote />
                <blockquote className="statement" style={{ margin: 0 }}>{q.quote}</blockquote>
                <figcaption className="small muted">— {q.attribution}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* G · ENROLLMENT CTA */}
      <section aria-labelledby="cta-h" style={{ padding: 'clamp(24px,3vw,40px) clamp(12px,2vw,24px)' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--blue-dd)', borderRadius: 'clamp(24px,3vw,40px)', color: '#fff' }}>
          <div className="blob" style={{ width: 520, height: 520, left: -160, bottom: -280, background: 'var(--blue)', opacity: 0.55 }} />
          <div className="blob" style={{ width: 260, height: 260, right: '8%', top: -110, background: 'var(--yellow)', opacity: 0.9 }} />
          <div aria-hidden="true" style={{ position: 'absolute', right: '22%', bottom: 40, width: 70, height: 70, borderRadius: 20, background: 'var(--lav)', transform: 'rotate(-14deg)' }} />
          <div className="wrap stack" style={{ position: 'relative', gap: 28, paddingBlock: 'clamp(72px,9vw,128px)', maxWidth: 1000, marginInline: 'auto', textAlign: 'center', alignItems: 'center' }}>
            <p className="eyebrow" style={{ color: '#FCEBB5' }}>Take the first step</p>
            <h2 id="cta-h" className="h1" style={{ color: '#fff' }}>
              Ready to Make Learning a More <span className="serif" style={{ fontWeight: 400, color: 'var(--yellow)' }}>Exciting Journey?</span>
            </h2>
            <p className="lead" style={{ color: '#DCE7F3', maxWidth: '52ch' }}>An enrollment inquiry starts a conversation with our team — it isn&apos;t a commitment or a confirmed place.</p>
            <div className="row stack-sm" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-accent" href="/admissions#inquiry">Start Your Enrollment Inquiry</Link>
              <Link className="btn btn-ghost" href="/contact">Ask a Question</Link>
            </div>
          </div>
        </div>
      </section>

      {/* H · CONTACT PREVIEW */}
      <section className="sec" aria-labelledby="cp-h">
        <div className="wrap split-75">
          <div className="stack" style={{ gap: 32 }}>
            <div className="stack" style={{ gap: 18 }}>
              <p className="eyebrow">Get in touch</p>
              <h2 id="cp-h" className="h2">We&apos;re right here <span className="serif" style={{ fontWeight: 400 }}>in Oxnard.</span></h2>
            </div>
            {s ? (
              <ul className="cols-3 cdl" style={{ listStyle: 'none' }}>
                <li className="stack" style={{ gap: 12 }}>
                  <span className="ibadge"><Pin size={22} /></span>
                  <span className="h4">Location</span>
                  <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer">{s.street}<br />{s.city}</a>
                </li>
                <li className="stack" style={{ gap: 12 }}>
                  <span className="ibadge" style={{ background: '#FCEBB5', color: 'var(--ink)' }}><Phone size={22} /></span>
                  <span className="h4">Phone</span>
                  <a href={`tel:${s.phoneHref}`}>{s.phone}</a>
                </li>
                <li className="stack" style={{ gap: 12 }}>
                  <span className="ibadge" style={{ background: 'var(--lav)', color: 'var(--lav-d)' }}><Mail size={22} /></span>
                  <span className="h4">Email</span>
                  <a href={`mailto:${s.email}`} style={{ overflowWrap: 'anywhere' }}>{s.email}</a>
                </li>
              </ul>
            ) : (
              <ErrorState message="Contact details couldn’t be loaded. Please try again shortly." />
            )}
            <div><Link className="btn btn-primary" href="/contact">Contact Us</Link></div>
          </div>
          <Link href="/contact#map" className="frame f-sky" style={{ display: 'block', aspectRatio: '5 / 4', textDecoration: 'none', color: 'var(--ink)' }} aria-label="View our location on the Contact page">
            <MapArt />
            <span className="cap">Map preview · View location</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function ProgramTile({ program: p, variant }: { program: Program; variant: number }) {
  const href = `/programs?view=${p.slug}`;
  const more = (
    <Link className="link-arrow" href={href} style={{ marginTop: 'auto' }}>
      Learn More <span className="sr-only">about {p.name}</span><Arrow />
    </Link>
  );
  if (variant === 0)
    return (
      <article className="ptile big sr" style={{ background: '#fff', padding: 0 }}>
        <Frame src={p.image} tone={toneClass(p.tone)} zoom style={{ borderRadius: 0, aspectRatio: '16 / 11' }} />
        <div className="stack" style={{ gap: 14, padding: 30 }}>
          {p.category && <span className={`tag ${tagClass(p.tone)}`}>{p.category}</span>}
          <h3 className="h3" style={{ fontSize: '1.6rem' }}>{p.name}</h3>
          <Txt text={p.summary} />
          <div className="meta">
            {p.ageGroup && <span>Ages: <b style={{ fontWeight: 600 }}>{p.ageGroup}</b></span>}
            {p.objectives.length > 0 && <span>{p.objectives.length} learning objectives</span>}
          </div>
          {more}
        </div>
      </article>
    );
  if (variant === 3)
    return (
      <article className="ptile wide sr" style={{ background: 'var(--ink)', color: '#fff', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
        <div className="stack" style={{ gap: 10, flex: '1 1 260px' }}>
          {p.category && <span className="tag cr">{p.category}</span>}
          <h3 className="h3" style={{ color: '#fff' }}>{p.name}</h3>
          <p className="small" style={{ color: '#D5DEE8', fontStyle: p.isPlaceholder ? 'italic' : 'normal' }}>{p.summary}</p>
        </div>
        <Link className="btn btn-accent btn-sm" href={href}>Learn More<span className="sr-only"> about {p.name}</span></Link>
      </article>
    );
  const lav = variant === 1;
  return (
    <article className="ptile sr" style={lav ? { background: 'var(--lav)' } : { background: '#fff', border: '1.5px solid #C9DAEC' }}>
      <span className="ibadge" style={lav ? { background: '#fff', color: 'var(--lav-d)' } : { background: '#FCEBB5', color: 'var(--ink)' }}>
        {lav ? <Globe size={24} /> : <Brush size={24} />}
      </span>
      <h3 className="h3">{p.name}</h3>
      <Txt className="small" text={p.summary} />
      {more}
    </article>
  );
}

function MapArt() {
  return (
    <svg viewBox="0 0 500 400" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="500" height="400" fill="#E8F2FA" />
      <path d="M-20 120 Q160 90 260 160 T520 150" stroke="#fff" strokeWidth="26" fill="none" />
      <path d="M120 -20 L180 420" stroke="#fff" strokeWidth="18" />
      <path d="M330 -20 Q300 200 380 420" stroke="#fff" strokeWidth="14" fill="none" />
      <path d="M-20 300 L520 270" stroke="#fff" strokeWidth="12" />
      <rect x="200" y="200" width="90" height="60" rx="10" fill="#D5E5F4" />
      <rect x="30" y="170" width="70" height="90" rx="10" fill="#D5E5F4" />
      <circle cx="400" cy="70" r="40" fill="#D9ECD9" />
      <path d="M250 120c-22 0-38 16-38 37 0 28 38 63 38 63s38-35 38-63c0-21-16-37-38-37z" fill="#3F6E9E" stroke="#293746" strokeWidth="3" />
      <circle cx="250" cy="157" r="12" fill="#F8D979" />
    </svg>
  );
}
