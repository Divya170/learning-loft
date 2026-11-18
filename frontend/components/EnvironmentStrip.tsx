'use client';

import { useState } from 'react';

const BASE = [
  { img: '/art/art-reading.svg', tone: 'f-sky', ratio: '4 / 5', radius: '999px 999px 24px 24px', cap: 'Reading corner', alt: 'Illustration: reading corner' },
  { img: '/art/art-create.svg', tone: 'f-yel', ratio: '1', radius: '24px', cap: 'Creative workspace', alt: 'Illustration: creative materials' },
  { img: '/art/art-together.svg', tone: 'f-lav', ratio: '4 / 5', radius: '24px', cap: 'Guided discussion', alt: 'Illustration: conversation bubbles and a lightbulb' },
  { img: '/art/art-notebook.svg', tone: 'f-cream', ratio: '1', radius: '24px 120px 24px 24px', cap: 'Study space', alt: 'Illustration: notebook with checklist' },
];

/** Slow horizontal drift with a pause control (WCAG 2.2.2). */
export default function EnvironmentStrip() {
  const [paused, setPaused] = useState(false);
  const items = [...BASE, ...BASE.map((b) => ({ ...b, alt: '' }))];
  return (
    <>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button type="button" className="btn btn-ghost btn-sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div className={`drift ${paused ? 'paused' : ''}`} style={{ paddingLeft: 24 }}>
          {items.map((s, k) => (
            <figure className="env" key={k} aria-hidden={k >= BASE.length}>
              <div className={`frame ${s.tone}`} style={{ aspectRatio: s.ratio, borderRadius: s.radius }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="art" src={s.img} alt={s.alt} width={480} height={360} loading="lazy" />
              </div>
              <figcaption className="small" style={{ color: '#C8D3DE', marginTop: 12 }}>{s.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
