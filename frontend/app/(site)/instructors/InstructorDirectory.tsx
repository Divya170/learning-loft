'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Arrow } from '@/components/Icons';
import Sheet from '@/components/Sheet';
import { Frame, Ph, Txt } from '@/components/ui';
import { isBracketed, toneClass } from '@/lib/format';
import type { Instructor } from '@/lib/types';

const LOOKS = [
  { ratio: '4 / 5', radius: '999px 999px 24px 24px' },
  { ratio: '1', radius: '24px' },
  { ratio: '4 / 5', radius: '24px 24px 120px 24px' },
  { ratio: '1', radius: '24px 120px 24px 24px' },
  { ratio: '4 / 5', radius: '24px' },
  { ratio: '1', radius: '999px 999px 24px 24px' },
];

export default function InstructorDirectory({ people, initialView }: { people: Instructor[]; initialView: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? '/instructors';
  const [view, setView] = useState(initialView);
  const selected = people.find((p) => p.slug === view);
  const anyPlaceholder = people.some((p) => p.isPlaceholder);

  const open = (slug: string) => { setView(slug); router.replace(`${pathname}?view=${slug}`, { scroll: false }); };
  const close = () => { setView(''); router.replace(pathname, { scroll: false }); };

  return (
    <div className="stack" style={{ gap: 48 }}>
      <div className="between">
        <div className="stack" style={{ gap: 14 }}>
          <p className="eyebrow lav">Instructor directory</p>
          <h2 id="dir-h" className="h2">Our teaching team</h2>
        </div>
        {anyPlaceholder && (
          <div className="notice n-warn" style={{ maxWidth: 520, padding: '16px 20px' }}>
            <Alert color="#7A5A00" />
            <p className="small">Profiles publish once The Learning Loft supplies each instructor&apos;s name, photo and approved biography. Nothing here is invented.</p>
          </div>
        )}
      </div>

      {people.length === 0 ? (
        <div className="state" style={{ background: 'var(--cream)' }}>
          <h3 className="h3">Instructor profiles are coming soon</h3>
          <p className="muted">Want to know who will teach your student? Our team is happy to tell you.</p>
          <Link className="btn btn-primary" href="/contact">Contact Our Team</Link>
        </div>
      ) : (
        <div className="dir">
          {people.map((p, i) => {
            const look = LOOKS[i % LOOKS.length];
            return (
              <article key={p.id} className="prof stack" style={{ gap: 18 }}>
                <Frame src={p.photo} alt={p.isPlaceholder ? `Portrait placeholder for ${p.name}` : `Portrait of ${p.name}`} tone={toneClass(p.tone)} className="portrait" style={{ aspectRatio: look.ratio, borderRadius: look.radius }} caption={p.isPlaceholder ? 'Instructor photo' : undefined} />
                <div className="stack" style={{ gap: 8 }}>
                  <h3 className="h3">{p.name}</h3>
                  {p.position && <p className="small" style={{ color: 'var(--blue-d)', fontWeight: 600 }}>{p.position}</p>}
                  {p.qualification && <p className="small"><span className="tag lav" style={{ textTransform: 'none', letterSpacing: 0 }}>{p.qualification}</span></p>}
                  {p.shortBio && <Txt className="small" text={p.shortBio} />}
                  <button type="button" className="link-arrow" aria-haspopup="dialog" onClick={() => open(p.slug)}>
                    View profile<span className="sr-only"> of {p.name}</span><Arrow />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {view && (
        <Sheet labelledBy="pr-h" onClose={close} closeLabel="Close profile" header={<span className="small muted">Instructor profile</span>}>
          {!selected ? (
            <div className="stack" style={{ gap: 16, padding: 32 }}>
              <h2 id="pr-h" className="h3">Profile not found</h2>
              <p className="muted">This instructor profile is no longer available.</p>
              <button type="button" className="btn btn-secondary" onClick={close}>Back to directory</button>
            </div>
          ) : (
            <div className="stack" style={{ gap: 28, padding: '32px clamp(20px,4vw,40px) 40px' }}>
              {selected.isPlaceholder && <Ph>Placeholder profile</Ph>}
              <div className="row" style={{ gap: 24, alignItems: 'flex-end' }}>
                <Frame src={selected.photo} alt="" tone={toneClass(selected.tone)} className="portrait" style={{ width: 200, aspectRatio: '4 / 5', borderRadius: '999px 999px 24px 24px', flex: 'none' }} />
                <div className="stack" style={{ gap: 8 }}>
                  <h2 id="pr-h" className="h2" style={{ fontSize: 'clamp(1.7rem,3vw,2.2rem)' }}>{selected.name}</h2>
                  {selected.position && <p style={{ color: 'var(--blue-d)', fontWeight: 600 }}>{selected.position}</p>}
                </div>
              </div>
              <dl className="stack" style={{ gap: 0, margin: 0, borderBottom: '1px solid var(--line)' }}>
                {[
                  ['Qualifications', selected.qualification],
                  ['Teaching experience', selected.experience],
                  ['Areas of expertise', selected.expertise],
                  ['Biography', selected.biography || selected.shortBio],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div className="dl-row" key={k}>
                      <dt className="h4">{k}</dt>
                      <dd className={isBracketed(v) ? 'phc' : ''} style={{ margin: 0, whiteSpace: 'pre-line' }}>{v}</dd>
                    </div>
                  ))}
              </dl>
              <div className="row stack-sm">
                <Link className="btn btn-primary" href="/contact">Contact Our Team</Link>
                <button type="button" className="btn btn-secondary" onClick={close}>Back to directory</button>
              </div>
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}
