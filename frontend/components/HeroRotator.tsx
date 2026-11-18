'use client';

import { useEffect, useState } from 'react';
import { Pause, Pin, Play } from './Icons';

const SLIDES = [
  { src: '/art/art-reading.svg', alt: 'Illustration: a stack of books, an open book and a desk lamp', cap: 'Reading & study' },
  { src: '/art/art-explore.svg', alt: 'Illustration: a globe and a telescope under the stars', cap: 'Exploring the world' },
  { src: '/art/art-create.svg', alt: 'Illustration: paper with shapes, pencils and a ruler', cap: 'Creative learning' },
];

/** Slow cross-fading hero imagery: 6.5s per slide, pauses on hover/focus, user-pausable, off for reduced motion. */
export default function HeroRotator({ street }: { street?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused || hover) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, [paused, hover]);

  return (
    <div className="hero-vis rv d2" style={{ position: 'relative', padding: '24px 24px 56px 40px' }}>
      <div
        className="frame f-sky arch"
        style={{ aspectRatio: '4 / 4.6', boxShadow: 'inset 0 0 0 1.5px rgba(41,55,70,.08)' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <div className="kb" style={{ position: 'absolute', inset: 0 }}>
          {SLIDES.map((s, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              className={`art xf ${k === i ? 'on' : ''}`}
              src={s.src}
              alt={k === i ? s.alt : ''}
              aria-hidden={k !== i}
              width={480}
              height={360}
              style={{ padding: '16% 10% 22%' }}
              fetchPriority={k === 0 ? 'high' : 'low'}
            />
          ))}
        </div>
        <span className="cap" aria-live="polite">{SLIDES[i].cap} · illustration</span>
      </div>
      {street && (
        <div className="float-card float" style={{ position: 'absolute', left: 0, top: '18%', background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: 'var(--sh)', display: 'flex', gap: 12, alignItems: 'center', maxWidth: 230 }}>
          <span className="ibadge" style={{ width: 40, height: 40, background: '#FCEBB5', color: 'var(--ink)' }}><Pin /></span>
          <span className="xs" style={{ lineHeight: 1.35 }}>
            <b style={{ fontFamily: 'var(--fh)', fontSize: '.875rem', display: 'block' }}>Visit us in Oxnard</b>
            {street}
          </span>
        </div>
      )}
      <div className="float-2" aria-hidden="true" style={{ position: 'absolute', right: '2%', top: '4%', width: 64, height: 64, borderRadius: 18, background: 'var(--lav)', transform: 'rotate(12deg)' }} />
      <div className="float" aria-hidden="true" style={{ position: 'absolute', right: '12%', bottom: 18, width: 46, height: 46, borderRadius: '50%', background: 'var(--yellow)' }} />
      <div className="row" style={{ position: 'absolute', left: 40, bottom: 0, gap: 8 }}>
        {SLIDES.map((s, k) => (
          <button key={s.src} type="button" className="dot-btn" aria-label={`Show image ${k + 1}: ${s.cap}`} aria-pressed={k === i} onClick={() => { setI(k); setPaused(true); }}>
            <span />
          </button>
        ))}
        <button type="button" className="icon-btn" style={{ width: 44, height: 44 }} aria-label={paused ? 'Play image rotation' : 'Pause image rotation'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? <Play /> : <Pause />}
        </button>
      </div>
    </div>
  );
}
