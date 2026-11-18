'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Arrow, Check, Close, Person, Trend } from '@/components/Icons';
import Sheet from '@/components/Sheet';
import { ErrorState, Frame, Ph, Txt } from '@/components/ui';
import { api, ApiError, qs } from '@/lib/api';
import { tagClass, toneClass } from '@/lib/format';
import type { Program, ProgramFacets } from '@/lib/types';

type Filters = { category: string; ageGroup: string; level: string };
const GROUPS: { key: keyof Filters; label: string; facet: keyof Omit<ProgramFacets, 'total'> }[] = [
  { key: 'category', label: 'Category', facet: 'category' },
  { key: 'ageGroup', label: 'Age group', facet: 'ageGroup' },
  { key: 'level', label: 'Learning level', facet: 'level' },
];

export default function ProgramBrowser({
  initialPrograms,
  facets,
  initialFilters,
  initialView,
}: {
  initialPrograms: Program[];
  facets: ProgramFacets;
  initialFilters: Filters;
  initialView: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '/programs';
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [programs, setPrograms] = useState(initialPrograms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState(initialView);
  const first = useRef(true);

  // Only offer filters that have real data behind them (more than one distinct value).
  const groups = GROUPS.filter((g) => facets[g.facet].length > 1);
  const usesPlaceholders = programs.some((p) => p.isPlaceholder) || facets.category.some((f) => /^\[/.test(f.value));

  const syncUrl = useCallback(
    (f: Filters, v: string) => router.replace(`${pathname}${qs({ ...f, view: v })}`, { scroll: false }),
    [router, pathname],
  );

  // Server-side filtering through the API whenever filters change.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api<Program[]>(`/programs${qs(filters)}`, { signal: ctrl.signal })
      .then(setPrograms)
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load programs.'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [filters]);

  const setFilter = (key: keyof Filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    syncUrl(next, view);
  };
  const clear = () => {
    const next = { category: '', ageGroup: '', level: '' };
    setFilters(next);
    syncUrl(next, view);
  };
  const openView = (slug: string) => { setView(slug); syncUrl(filters, slug); };
  const closeView = () => { setView(''); syncUrl(filters, ''); };

  const active = GROUPS.filter((g) => filters[g.key]).map((g) => ({ ...g, value: filters[g.key] }));

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div className="between">
        <div className="stack" style={{ gap: 14 }}>
          <h2 id="br-h" className="h2">All programs</h2>
          {usesPlaceholders && <Ph>Preview — categories &amp; age groups come from placeholder program data</Ph>}
        </div>
        <p className="muted" role="status" aria-live="polite">
          {loading ? 'Updating…' : <><b style={{ color: 'var(--ink)' }}>{programs.length}</b> of {facets.total} programs shown</>}
        </p>
      </div>

      {groups.length > 0 && (
        <div className="stack" style={{ gap: 16, padding: 24, borderRadius: 20, background: 'var(--cream)' }}>
          <div className="fbar">
            {groups.map((g) => (
              <FilterGroup key={g.key} id={`f-${g.key}`} label={g.label} value={filters[g.key]} options={facets[g.facet]} onPick={(v) => setFilter(g.key, v)} />
            ))}
          </div>
          {active.length > 0 && (
            <div className="row" style={{ gap: 10, paddingTop: 14, borderTop: '1px solid #EADFC6' }}>
              <span className="small muted">Active filters:</span>
              {active.map((a) => (
                <button key={a.key} type="button" className="chip" style={{ minHeight: 38, borderColor: 'var(--blue-d)', color: 'var(--blue-dd)' }} onClick={() => setFilter(a.key, '')} aria-label={`Remove filter ${a.label}: ${a.value}`}>
                  {a.value} <Close size={14} strokeWidth={2.6} />
                </button>
              ))}
              <button type="button" className="link-arrow" style={{ fontSize: '.9375rem' }} onClick={clear}>Clear filters</button>
            </div>
          )}
        </div>
      )}

      {error ? (
        <ErrorState message={error} action={<button type="button" className="link-arrow" onClick={() => setFilters({ ...filters })}>Try again</button>} />
      ) : programs.length === 0 ? (
        <div className="state" style={{ border: '1.5px dashed #C3CEDA' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/art-notebook.svg" alt="" width={180} height={135} />
          <h3 className="h3">{active.length ? 'No programs match these filters' : 'Programs are coming soon'}</h3>
          <p className="muted" style={{ maxWidth: '44ch' }}>
            {active.length ? 'Try a different category or age group — or ask us directly and we’ll help you find the right fit.' : 'Our team is preparing program details. Ask us what’s available now.'}
          </p>
          <div className="row stack-sm" style={{ justifyContent: 'center' }}>
            {active.length > 0 && <button type="button" className="btn btn-primary" onClick={clear}>Clear filters</button>}
            <Link className="btn btn-secondary" href="/contact">Ask Our Team</Link>
          </div>
        </div>
      ) : (
        <div className={`auto ${loading ? 'busy' : ''}`} aria-busy={loading} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
          {programs.map((p) => (
            <article key={p.id} className="pcard">
              <Frame src={p.image} tone={toneClass(p.tone)} zoom caption={p.isPlaceholder ? 'Program image' : undefined} />
              <div className="stack" style={{ gap: 14, padding: '26px 26px 28px', flex: 1 }}>
                {p.category && <span className={`tag ${tagClass(p.tone)}`}>{p.category}</span>}
                <h3 className="h3">{p.name}</h3>
                <Txt className="small" text={p.summary} />
                <div className="meta">
                  {p.ageGroup && <span><Person />{p.ageGroup}</span>}
                  {p.level && <span><Trend />{p.level}</span>}
                </div>
                <div className="line-t" style={{ marginTop: 'auto', paddingTop: 12 }}>
                  <button type="button" className="link-arrow" onClick={() => openView(p.slug)} aria-haspopup="dialog">
                    View Details<span className="sr-only"> for {p.name}</span><Arrow />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {view && <ProgramDetail slug={view} onClose={closeView} onOpen={openView} />}
    </div>
  );
}

function FilterGroup({ id, label, value, options, onPick }: { id: string; label: string; value: string; options: { value: string; count: number }[]; onPick: (v: string) => void }) {
  return (
    <>
      <span className="flabel" id={id}>{label}</span>
      <div className="chips scroll" role="group" aria-labelledby={id}>
        <button type="button" className="chip" aria-pressed={!value} onClick={() => onPick('')}>All</button>
        {options.map((o) => (
          <button key={o.value} type="button" className="chip" aria-pressed={value === o.value} onClick={() => onPick(o.value)}>
            {o.value} <span className="ct">{o.count}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/** Reusable program-detail layout, loaded from GET /api/programs/:slug. */
function ProgramDetail({ slug, onClose, onOpen }: { slug: string; onClose: () => void; onOpen: (slug: string) => void }) {
  const [data, setData] = useState<{ program: Program; related: Program[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    setData(null);
    setError('');
    api<{ program: Program; related: Program[] }>(`/programs/${encodeURIComponent(slug)}`, { signal: ctrl.signal })
      .then(setData)
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError && e.status === 404 ? 'This program is no longer available.' : 'Program details couldn’t be loaded.'); });
    return () => ctrl.abort();
  }, [slug]);

  const p = data?.program;
  return (
    <Sheet labelledBy="pd-h" onClose={onClose} closeLabel="Close program details" header={p?.category ? <span className={`tag ${tagClass(p.tone)}`}>{p.category}</span> : <span className="small muted">Program</span>}>
      {error ? (
        <div style={{ padding: 32 }}>
          <h2 id="pd-h" className="sr-only">Program details</h2>
          <ErrorState message={error} action={<button type="button" className="link-arrow" onClick={onClose}>Back to all programs</button>} />
        </div>
      ) : !p ? (
        <div className="stack" style={{ gap: 16, padding: 32 }} aria-busy="true">
          <h2 id="pd-h" className="sr-only">Loading program details</h2>
          <div className="skeleton" style={{ height: 220 }} />
          <div className="skeleton" style={{ height: 32, width: '70%' }} />
          <div className="skeleton" style={{ height: 80 }} />
        </div>
      ) : (
        <>
          <Frame src={p.image} tone={toneClass(p.tone)} style={{ borderRadius: 0, aspectRatio: '16 / 9', flex: 'none' }} caption={p.isPlaceholder ? 'Supporting program imagery' : undefined} />
          <div className="stack" style={{ gap: 28, padding: '32px clamp(20px,4vw,40px) 40px' }}>
            <div className="stack" style={{ gap: 12 }}>
              {p.isPlaceholder && <Ph>Placeholder — shows confirmed details once supplied</Ph>}
              <h2 id="pd-h" className="h2" style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)' }}>{p.name}</h2>
              {p.introduction && <Txt text={p.introduction} />}
            </div>
            {(p.ageGroup || p.level) && (
              <div className="cols-2" style={{ gap: 16 }}>
                {p.ageGroup && <div className="card" style={{ padding: 20, background: 'var(--sky)', border: 0 }}><p className="flabel">Eligibility</p><p style={{ fontWeight: 600, marginTop: 6 }}>{p.ageGroup}</p></div>}
                {p.level && <div className="card" style={{ padding: 20, background: 'var(--cream)', border: 0 }}><p className="flabel">Learning level</p><p style={{ fontWeight: 600, marginTop: 6 }}>{p.level}</p></div>}
              </div>
            )}
            {p.objectives.length > 0 && (
              <div className="stack" style={{ gap: 12 }}>
                <h3 className="h4">Learning objectives</h3>
                <ul className="stack" style={{ gap: 10, listStyle: 'none' }}>
                  {p.objectives.map((o) => (
                    <li key={o} className="row" style={{ gap: 12, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                      <span className="ibadge" style={{ width: 28, height: 28, borderRadius: 8 }}><Check size={14} /></span>
                      <Txt as="span" text={o} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.activities && (
              <div className="stack" style={{ gap: 12 }}>
                <h3 className="h4">Learning activities</h3>
                <Txt text={p.activities} />
              </div>
            )}
            <div className="notice n-warn">
              <Alert size={22} color="#7A5A00" />
              <p className="small">Schedules, availability and fees are shared by our team after you submit an inquiry.</p>
            </div>
            <Link className="btn btn-primary" href={`/admissions?program=${p.id}#inquiry`}>Enquire About This Program</Link>
            {data.related.length > 0 && (
              <div className="stack line-t" style={{ gap: 14, paddingTop: 24 }}>
                <h3 className="h4">Related programs</h3>
                {data.related.map((r) => (
                  <button key={r.id} type="button" className="card hov" style={{ display: 'flex', gap: 16, alignItems: 'center', textAlign: 'left', cursor: 'pointer', padding: 14, font: 'inherit', color: 'inherit' }} onClick={() => onOpen(r.slug)}>
                    <Frame src={r.image} tone={toneClass(r.tone)} style={{ width: 72, height: 72, borderRadius: 14, flex: 'none' }} imgStyle={{ padding: '10%' }} />
                    <span className="stack" style={{ gap: 4 }}>
                      <b className="h4">{r.name}</b>
                      <span className="small muted">{r.ageGroup}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
