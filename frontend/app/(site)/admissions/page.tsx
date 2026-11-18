import type { Metadata } from 'next';
import Link from 'next/link';
import Faq from '@/components/Faq';
import { Doc } from '@/components/Icons';
import { Crumbs, ErrorState, Frame, Ph, Txt } from '@/components/ui';
import { load } from '@/lib/api';
import type { Faq as FaqItem, ProgramOption, Requirement, SiteSettings } from '@/lib/types';
import EnrollmentForm from './EnrollmentForm';

export const metadata: Metadata = { title: 'Admissions & Enrollment Inquiry', description: 'How enrollment works at The Learning Loft, and a simple form to start your inquiry.' };

const STEPS = [
  ['Explore Programs', 'Browse what’s offered and note the programs that interest your student.'],
  ['Submit an Enrollment Inquiry', 'Share a few details using the form below. You’re here.'],
  ['Discuss Learning Requirements', 'Talk with our team about your student’s needs and goals.'],
  ['Receive Enrollment Guidance', 'Get guidance on the right program and what’s needed next.'],
  ['Complete Registration', 'Finalise registration with the center to confirm a place.'],
];

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdmissionsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const programParam = Array.isArray(sp.program) ? sp.program[0] : sp.program;
  const [requirements, faqs, options, site] = await Promise.all([
    load<Requirement[]>('/requirements'),
    load<FaqItem[]>('/faqs'),
    load<ProgramOption[]>('/programs/options'),
    load<SiteSettings>('/site'),
  ]);
  const reqs = requirements.data ?? [];
  const s = site.data;

  return (
    <>
      <section className="phero" aria-labelledby="ad-h">
        <div className="blob" style={{ width: 380, height: 380, right: '6%', top: -120, background: 'var(--yellow)', opacity: 0.85 }} />
        <div className="blob" style={{ width: 300, height: 300, right: '30%', bottom: -200, background: 'var(--lav)' }} />
        <div className="wrap split-75" style={{ position: 'relative', paddingBlock: 'clamp(40px,6vw,96px)' }}>
          <div className="stack" style={{ gap: 26 }}>
            <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Admissions' }]} />
            <h1 id="ad-h" className="display rv d1" style={{ fontSize: 'clamp(2.5rem,5.6vw,4.8rem)' }}>
              Your Learning Journey <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Starts Here.</span>
            </h1>
            <p className="lead rv d2">Starting is simple: send us an enrollment inquiry with a few details about your student. Our team will follow up to talk through programs and next steps.</p>
            <div className="row stack-sm rv d3">
              <a className="btn btn-primary" href="#inquiry">Begin Enrollment</a>
              <a className="btn btn-secondary" href="#faq">Read the FAQs</a>
            </div>
          </div>
          <Frame src="/art/art-notebook.svg" alt="Illustration: a notebook with a checklist" tone="f-white" kenBurns priority className="rv d2 hide-sm" style={{ aspectRatio: '1', borderRadius: '28px 28px 28px 200px', border: 0 }} />
        </div>
      </section>

      <section className="sec" aria-labelledby="pr-h">
        <div className="wrap stack" style={{ gap: 56 }}>
          <div className="between">
            <div className="stack" style={{ gap: 16, maxWidth: 620 }}>
              <p className="eyebrow">How enrollment works</p>
              <h2 id="pr-h" className="h2">Five steps, <span className="serif" style={{ fontWeight: 400 }}>one conversation at a time.</span></h2>
            </div>
            <Ph>Proposed stages — pending confirmation by the center</Ph>
          </div>
          <ol className="tl" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {STEPS.map(([t, d], i) => (
              <li key={t} className="tl-s sr">
                <span className="tl-dot">{i + 1}</span>
                <div className="stack" style={{ gap: 6 }}>
                  <h3 className="h4">{t}</h3>
                  <p className="small muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-s" aria-labelledby="rq-h" style={{ background: 'var(--cream)' }}>
        <div className="wrap split-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 16 }}>
            <p className="eyebrow">Registration requirements</p>
            <h2 id="rq-h" className="h2">What you&apos;ll need <span className="serif" style={{ fontWeight: 400 }}>to register.</span></h2>
            <p className="muted">You don&apos;t need any documents to send an inquiry. The items below apply at the registration stage.</p>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            {reqs.some((r) => r.isPlaceholder) && <Ph>Requirements to be confirmed by The Learning Loft</Ph>}
            {requirements.error ? (
              <ErrorState message="Registration requirements couldn’t be loaded. Our team can share them when they follow up." />
            ) : reqs.length === 0 ? (
              <p className="muted">Our team will share registration requirements when they follow up on your inquiry.</p>
            ) : (
              <ul className="req-list" style={{ margin: 0, padding: 0, borderTop: '1px solid #EADFC6' }}>
                {reqs.map((r) => (
                  <li key={r.id}>
                    <span className="ibadge" style={{ width: 40, height: 40, borderRadius: 12, background: '#fff' }}><Doc size={18} /></span>
                    <div className="stack" style={{ gap: 2 }}>
                      <b className="h4">{r.title}</b>
                      {r.detail && <Txt as="span" className="small" text={r.detail} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section id="inquiry" className="sec" aria-labelledby="fq-h" style={{ scrollMarginTop: 80 }}>
        <div className="wrap fwrap">
          <aside className="stack sticky" style={{ gap: 28 }}>
            <div className="stack" style={{ gap: 16 }}>
              <p className="eyebrow">Enrollment inquiry</p>
              <h2 id="fq-h" className="h2">Tell us about <span className="serif" style={{ fontWeight: 400 }}>your student.</span></h2>
              <p className="muted">It takes about two minutes. An inquiry starts a conversation — it is not an application and doesn&apos;t confirm admission.</p>
            </div>
            <div className="card" style={{ background: 'var(--sky)', border: 0, padding: 26 }}>
              <div className="stack" style={{ gap: 14 }}>
                <div className="between" style={{ alignItems: 'center' }}><h3 className="h4">What happens next</h3><Ph>Proposed</Ph></div>
                <ol className="stack small" style={{ gap: 12, margin: 0, paddingLeft: 20 }}>
                  <li>Our team reviews your inquiry.</li>
                  <li>We reach out using your preferred contact method.</li>
                  <li>Together we discuss programs and next steps.</li>
                </ol>
              </div>
            </div>
            {s && (
              <div className="stack small" style={{ gap: 8 }}>
                <span className="muted">Prefer to talk?</span>
                <a href={`tel:${s.phoneHref}`} style={{ fontWeight: 700, fontFamily: 'var(--fh)', fontSize: '1.15rem', color: 'var(--ink)', textDecoration: 'none' }}>{s.phone}</a>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </div>
            )}
          </aside>
          <div className="card" style={{ padding: 'clamp(24px,4vw,48px)', borderRadius: 28, boxShadow: 'var(--sh)' }}>
            <EnrollmentForm programs={options.data ?? []} programsUnavailable={!!options.error} initialProgramId={programParam ?? ''} privacyUrl={s?.privacyUrl ?? ''} />
          </div>
        </div>
      </section>

      <section id="faq" className="sec" aria-labelledby="faq-h" style={{ background: 'var(--sky)', scrollMarginTop: 80 }}>
        <div className="wrap split-57" style={{ alignItems: 'start' }}>
          <div className="stack sticky" style={{ gap: 16 }}>
            <p className="eyebrow">Admissions FAQs</p>
            <h2 id="faq-h" className="h2">Questions families <span className="serif" style={{ fontWeight: 400 }}>often ask.</span></h2>
          </div>
          {faqs.error ? <ErrorState message="FAQs couldn’t be loaded right now." /> : <Faq items={faqs.data ?? []} />}
        </div>
      </section>

      <section className="sec-s" aria-labelledby="fc-h">
        <div className="wrap between" style={{ alignItems: 'center' }}>
          <h2 id="fc-h" className="h2" style={{ maxWidth: 640 }}>Have questions? <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>We&apos;re happy to help.</span></h2>
          <div className="row stack-sm">
            <Link className="btn btn-primary" href="/contact">Contact Our Team</Link>
            {s && <a className="btn btn-secondary" href={`tel:${s.phoneHref}`}>Call Us</a>}
          </div>
        </div>
      </section>
    </>
  );
}
