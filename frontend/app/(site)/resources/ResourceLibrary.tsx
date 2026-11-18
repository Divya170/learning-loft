'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Book, Brush, Grid, Map as MapIcon, Rising, Search, Users } from '@/components/Icons';
import { ErrorState, Frame, Ph } from '@/components/ui';
import { api, ApiError, qs } from '@/lib/api';
import { formatDate, isBracketed, tagClass, toneClass } from '@/lib/format';
import type { Facet, Paged, Resource } from '@/lib/types';

const PAGE_SIZE = 9;
const CAT_STYLE: Record<string, { bg: string; icon: ReactNode }> = {
  'Study Resources': { bg: 'var(--sky)', icon: <Book /> },
  'Learning Guides': { bg: 'var(--lav)', icon: <MapIcon /> },
  'Parent Information': { bg: 'var(--cream)', icon: <Users /> },
  'Educational Activities': { bg: '#FCEBB5', icon: <Brush /> },
  'Student Development': { bg: '#fff', icon: <Rising /> },
};

export default function ResourceLibrary({
  categories,
  initialPage,
  initial,
}: {
  categories: Facet[];
  initialPage: Paged<Resource>;
  initial: { q: string; category: string };
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '/resources';
  const [q, setQ] = useState(initial.q);
  const [query, setQuery] = useState(initial.q); // debounced
  const [category, setCategory] = useState(initial.category);
  const [items, setItems] = useState(initialPage.items);
  const [meta, setMeta] = useState({ total: initialPage.total, page: initialPage.page, pageCount: initialPage.pageCount });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const first = useRef(true);
  const total = categories.reduce((n, c) => n + c.count, 0);

  // Debounce typing so the API is queried ~300ms after the user pauses.
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    router.replace(`${pathname}${qs({ q: query, category })}`, { scroll: false });
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api<Paged<Resource>>(`/resources${qs({ q: query, category, pageSize: PAGE_SIZE })}`, { signal: ctrl.signal })
      .then((d) => { setItems(d.items); setMeta({ total: d.total, page: d.page, pageCount: d.pageCount }); })
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load resources.'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [query, category, reload, router, pathname]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const d = await api<Paged<Resource>>(`/resources${qs({ q: query, category, pageSize: PAGE_SIZE, page: meta.page + 1 })}`);
      setItems((prev) => [...prev, ...d.items]);
      setMeta({ total: d.total, page: d.page, pageCount: d.pageCount });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load more resources.');
    } finally {
      setLoadingMore(false);
    }
  }

  const clear = () => { setQ(''); setQuery(''); setCategory(''); };
  const hasFilters = !!query || !!category;

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div className="stack" style={{ gap: 16 }}>
        <p className="eyebrow">Resource library</p>
        <h2 id="lib-h" className="h2">Browse by topic</h2>
        <Ph>Proposed categories — pending confirmation</Ph>
      </div>

      <div className="cats" role="group" aria-label="Filter by category">
        <button type="button" className="cat" style={{ background: category ? '#F3F6F9' : 'var(--sky)' }} aria-pressed={!category} onClick={() => setCategory('')}>
          <span className="ibadge" style={{ background: '#fff', width: 44, height: 44 }}><Grid /></span>
          <span className="stack" style={{ gap: 4 }}><b className="h4">All topics</b><span className="xs muted">{total} resources</span></span>
        </button>
        {categories.map((c) => {
          const style = CAT_STYLE[c.value] ?? { bg: '#fff', icon: <Book /> };
          return (
            <button key={c.value} type="button" className="cat" style={{ background: style.bg }} aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>
              <span className="ibadge" style={{ background: '#fff', width: 44, height: 44 }}>{style.icon}</span>
              <span className="stack" style={{ gap: 4 }}><b className="h4">{c.value}</b><span className="xs muted">{c.count} resource{c.count === 1 ? '' : 's'}</span></span>
            </button>
          );
        })}
      </div>

      <div className="between" style={{ alignItems: 'center', gap: 16 }}>
        <div className="search" style={{ flex: '1 1 320px', maxWidth: 520 }}>
          <label htmlFor="q" className="sr-only">Search resources by title</label>
          <Search />
          <input id="q" className="input" type="search" placeholder="Search by article title" value={q} maxLength={100} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
        <div className="row" style={{ gap: 14 }}>
          <p className="small muted" role="status" aria-live="polite">
            {loading ? 'Searching…' : `${meta.total} resource${meta.total === 1 ? '' : 's'}${category ? ` in ${category}` : ''}`}
          </p>
          {hasFilters && <button type="button" className="link-arrow" style={{ fontSize: '.9375rem' }} onClick={clear}>Clear filters</button>}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} action={<button type="button" className="link-arrow" onClick={() => setReload((n) => n + 1)}>Try again</button>} />
      ) : items.length === 0 && !loading ? (
        <div className="state" style={{ background: 'var(--cream)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/art-explore.svg" alt="" width={180} height={135} />
          <h3 className="h3">{query ? `No resources match “${query}”` : 'No resources in this topic yet'}</h3>
          <p className="muted" style={{ maxWidth: '42ch' }}>Try a shorter search, another topic, or clear your filters to see everything.</p>
          {hasFilters && <button type="button" className="btn btn-primary" onClick={clear}>Clear search &amp; filters</button>}
        </div>
      ) : (
        <>
          <div className={`auto ${loading ? 'busy' : ''}`} aria-busy={loading} style={{ gap: '44px 28px' }}>
            {items.map((r) => (
              <Link key={r.id} href={`/resources/${r.slug}`} className="rcard">
                <Frame src={r.cover} tone={toneClass(r.tone)} />
                <span className={`tag ${tagClass(r.tone)}`}>{r.category}</span>
                <span className="h3">{r.title}</span>
                {r.summary && <span className={`small ${isBracketed(r.summary) ? 'phc' : 'muted'}`}>{r.summary}</span>}
                <span className="xs muted">
                  {[r.publishedOn ? formatDate(r.publishedOn) : '', r.readMinutes ? `${r.readMinutes} min read` : ''].filter(Boolean).join(' · ') || (r.isPlaceholder ? '[Publication date] · [Read time]' : '')}
                </span>
              </Link>
            ))}
          </div>
          {meta.page < meta.pageCount && (
            <div className="pager">
              <button type="button" className="btn btn-secondary" disabled={loadingMore} aria-busy={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : `Load more (${meta.total - items.length} more)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
