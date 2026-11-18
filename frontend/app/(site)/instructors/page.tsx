import type { Metadata } from 'next';
import Link from 'next/link';
import { Crumbs, ErrorState, Frame } from '@/components/ui';
import { load } from '@/lib/api';
import type { Instructor } from '@/lib/types';
import InstructorDirectory from './InstructorDirectory';

export const metadata: Metadata = { title: 'Our Instructors', description: 'Meet the instructors who guide students at The Learning Loft.' };

const FACES = [
  { tone: 'f-lav', ratio: '3 / 4', radius: '999px 999px 24px 24px' },
  { tone: 'f-yel', ratio: '3 / 4.6', radius: '24px' },
  { tone: 'f-sky', ratio: '3 / 5.2', radius: '999px 999px 24px 24px' },
  { tone: 'f-white', ratio: '3 / 4.6', radius: '24px 24px 24px 100px' },
  { tone: 'f-lav', ratio: '3 / 4', radius: '24px' },
];

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function InstructorsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const view = (Array.isArray(sp.view) ? sp.view[0] : sp.view) ?? '';
  const { data, error } = await load<Instructor[]>('/instructors');
  const people = data ?? [];

  return (
    <>
      <section className="phero cream" aria-labelledby="in-h">
        <div className="blob" style={{ width: 620, height: 620, left: '50%', top: '40%', transform: 'translateX(-50%)', background: 'var(--sky)' }} />
        <div className="wrap stack" style={{ position: 'relative', alignItems: 'center', textAlign: 'center', gap: 26, paddingBlock: 'clamp(40px,6vw,80px) clamp(64px,8vw,104px)' }}>
          <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Our Instructors' }]} />
          <h1 id="in-h" className="h1 rv d1" style={{ maxWidth: 900 }}>
            Meet the People Who <span className="serif" style={{ fontWeight: 400, color: 'var(--blue-d)' }}>Inspire Learning.</span>
          </h1>
          <p className="lead rv d2" style={{ maxWidth: '56ch' }}>Get to know the instructors who guide students at The Learning Loft — their roles, backgrounds and what they bring to every session.</p>
          <div className="faces rv d3" aria-hidden="true" style={{ marginTop: 20 }}>
            {FACES.map((f, i) => {
              const person = people[i];
              return (
                <Frame key={i} src={person?.photo ?? '/art/art-portrait.svg'} tone={f.tone} className="portrait" style={{ aspectRatio: f.ratio, borderRadius: f.radius }} imgStyle={{ padding: '18% 10% 0' }} priority />
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="dir-h">
        <div className="wrap">
          {error ? (
            <ErrorState message="Instructor profiles couldn’t be loaded right now. Please refresh or try again shortly." />
          ) : (
            <InstructorDirectory people={people} initialView={view} />
          )}
        </div>
      </section>

      <section aria-labelledby="tc-h" style={{ padding: '0 clamp(12px,2vw,24px) clamp(24px,3vw,40px)' }}>
        <div className="split" style={{ background: 'var(--sky)', borderRadius: 'clamp(24px,3vw,40px)', padding: 'clamp(36px,6vw,80px)', gap: 40 }}>
          <div className="stack" style={{ gap: 20 }}>
            <h2 id="tc-h" className="h2">Have a question for <span className="serif" style={{ fontWeight: 400 }}>our team?</span></h2>
            <p className="lead">Ask about who teaches which program, how sessions are guided, or anything else you&apos;d like to know before enrolling.</p>
            <div className="row stack-sm">
              <Link className="btn btn-primary" href="/contact">Contact Our Team</Link>
              <Link className="btn btn-secondary" href="/about">Learn About Us</Link>
            </div>
          </div>
          <Frame src="/art/art-together.svg" alt="Illustration: a conversation and a lightbulb" tone="f-white" zoom style={{ aspectRatio: '4 / 3', border: 0 }} />
        </div>
      </section>
    </>
  );
}
