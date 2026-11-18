import type { Metadata } from 'next';
import Link from 'next/link';
import EnvironmentStrip from '@/components/EnvironmentStrip';
import { Book, Home, Quote, Sprout, Target } from '@/components/Icons';
import { Crumbs, Frame, Ph } from '@/components/ui';

export const metadata: Metadata = { title: 'About', description: 'Learn about The Learning Loft, an education center in Oxnard, California.' };

const PILLARS = [
  { n: '01', title: 'Mission', text: '[Official mission statement.]', bg: 'var(--sky)', icon: <Target size={24} />, badge: { background: '#fff' }, numColor: undefined },
  { n: '02', title: 'Educational approach', text: '[How lessons are planned and delivered.]', bg: 'var(--cream)', icon: <Book size={24} />, badge: { background: '#fff', color: '#7A5A00' }, numColor: '#9A7400' },
  { n: '03', title: 'Student development', text: '[How the center supports each student’s growth.]', bg: 'var(--lav)', icon: <Sprout size={24} />, badge: { background: '#fff', color: 'var(--lav-d)' }, numColor: 'var(--lav-d)' },
  { n: '04', title: 'Learning environment', text: '[What the space feels like and how it’s set up.]', bg: '#fff', icon: <Home size={24} />, badge: {}, numColor: undefined },
];

export default function AboutPage() {
  return (
    <>
      <section aria-labelledby="ab-h" style={{ background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div className="wrap stack" style={{ gap: 'clamp(36px,5vw,64px)', paddingBlock: 'clamp(40px,6vw,88px) clamp(64px,8vw,112px)' }}>
          <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <div className="between" style={{ alignItems: 'flex-end' }}>
            <h1 id="ab-h" className="display rv d1" style={{ maxWidth: 900 }}>
              More Than a <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Place</span> to Learn.
            </h1>
            <p className="lead rv d2" style={{ maxWidth: 400 }}>The Learning Loft is an education center in Oxnard, California — a welcoming space built around curious, confident learners.</p>
          </div>
          <div className="mosaic rv d3">
            <Frame src="/art/art-reading.svg" alt="Illustration: a reading corner with books and a lamp" tone="f-sky" kenBurns priority style={{ borderRadius: '28px 160px 28px 28px' }} caption="Learning environment · photo to come" />
            <Frame src="/art/art-together.svg" alt="Illustration: conversation and ideas" tone="f-lav" zoom />
            <Frame src="/art/art-create.svg" alt="Illustration: creative materials" tone="f-yel" zoom style={{ borderRadius: '50%' }} imgStyle={{ padding: '16%' }} />
            <Frame src="/art/art-grow.svg" alt="Illustration: a sprout growing from a book" tone="f-white" zoom />
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="ci-h">
        <div className="wrap split-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 18 }}>
            <p className="eyebrow">Who we are</p>
            <h2 id="ci-h" className="h2">Our center, <span className="serif" style={{ fontWeight: 400 }}>our purpose.</span></h2>
          </div>
          <div className="stack" style={{ gap: 24 }}>
            <p className="statement" style={{ fontSize: 'clamp(1.45rem,2.4vw,2rem)' }}>
              A welcoming educational destination where students explore their potential, strengthen their knowledge and develop confidence.
            </p>
            <div className="ph-box">
              <Ph>Client-provided information only</Ph>
              <p className="phc">[Background — when The Learning Loft opened, who founded it and why.]</p>
              <p className="phc">[Purpose — the families and students the center serves.]</p>
              <p className="phc">[Educational identity — what sets the center&apos;s approach apart.]</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="phil-h" style={{ background: 'var(--lav)', position: 'relative', overflow: 'hidden' }}>
        <div className="blob" style={{ width: 460, height: 460, right: -120, bottom: -200, background: '#fff', opacity: 0.55 }} />
        <div className="wrap split-75" style={{ position: 'relative' }}>
          <div className="stack" style={{ gap: 28 }}>
            <p className="eyebrow lav">Educational philosophy</p>
            <h2 id="phil-h" className="sr-only">Educational philosophy</h2>
            <Quote size={56} />
            <p className="statement phc">[The Learning Loft&apos;s educational philosophy, in the center&apos;s own words — added once supplied.]</p>
            <Ph>Awaiting client statement</Ph>
          </div>
          <Frame src="/art/art-explore.svg" alt="Illustration: globe and telescope symbolising curiosity" tone="f-white" zoom style={{ aspectRatio: '1', borderRadius: '50%', border: 0 }} imgStyle={{ padding: '14%' }} />
        </div>
      </section>

      <section className="sec" aria-labelledby="ma-h">
        <div className="wrap stack" style={{ gap: 48 }}>
          <div className="stack" style={{ gap: 16, maxWidth: 680 }}>
            <p className="eyebrow">Mission &amp; approach</p>
            <h2 id="ma-h" className="h2">Four ideas, <span className="serif" style={{ fontWeight: 400 }}>one experience.</span></h2>
            <Ph>Placeholders for official statements</Ph>
          </div>
          <div className="pillars">
            {PILLARS.map((p) => (
              <article key={p.n} className="pill sr" style={{ background: p.bg, border: p.bg === '#fff' ? '1.5px solid var(--line)' : undefined }}>
                <div className="between" style={{ alignItems: 'center' }}>
                  <span className="ibadge" style={p.badge}>{p.icon}</span>
                  <span className="num" style={{ fontSize: '2rem', color: p.numColor }}>{p.n}</span>
                </div>
                <h3 className="h3">{p.title}</h3>
                <p className="phc">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="env-h" style={{ background: 'var(--ink)', color: '#fff', overflow: 'hidden' }}>
        <div className="wrap stack" style={{ gap: 16, maxWidth: 1240, marginBottom: 24 }}>
          <p className="eyebrow" style={{ color: '#FCEBB5' }}>Inside the Loft</p>
          <h2 id="env-h" className="h2" style={{ color: '#fff', maxWidth: 640 }}>
            A space made for <span className="serif" style={{ fontWeight: 400, color: 'var(--yellow)' }}>focus and discovery.</span>
          </h2>
          <p style={{ color: '#C8D3DE', maxWidth: 640 }}>Illustrations shown here are placeholders — they will be replaced with genuine photography of the center, not stock images of other spaces.</p>
        </div>
        <EnvironmentStrip />
      </section>

      <section className="sec" aria-labelledby="ac-h">
        <div className="wrap-n stack" style={{ textAlign: 'center', alignItems: 'center', gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/art-grow.svg" alt="" width={220} height={165} loading="lazy" />
          <h2 id="ac-h" className="h1">See where curiosity <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>can lead.</span></h2>
          <p className="lead">Explore the programs offered at The Learning Loft and find the right starting point.</p>
          <div className="row stack-sm" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary" href="/programs">Discover Our Programs</Link>
            <Link className="btn btn-secondary" href="/instructors">Meet Our Instructors</Link>
          </div>
        </div>
      </section>
    </>
  );
}
