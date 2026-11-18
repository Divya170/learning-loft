import type { Metadata } from 'next';
import Link from 'next/link';
import { Crumbs, ErrorState, Frame, Ph } from '@/components/ui';
import { load, qs } from '@/lib/api';
import { formatDate, isBracketed, toneClass } from '@/lib/format';
import type { Facet, Paged, Resource } from '@/lib/types';
import ResourceLibrary from './ResourceLibrary';

export const metadata: Metadata = { title: 'Learning Resources', description: 'Educational articles, learning guides and parent resources from The Learning Loft.' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function ResourcesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const initial = { q: one(sp.q), category: one(sp.category) };
  const [featured, categories, page] = await Promise.all([
    load<{ resource: Resource | null }>('/resources/featured'),
    load<Facet[]>('/resources/categories'),
    load<Paged<Resource>>(`/resources${qs({ ...initial, pageSize: 9 })}`),
  ]);
  const f = featured.data?.resource;
  const anyPlaceholder = !!f?.isPlaceholder || !!page.data?.items.some((r) => r.isPlaceholder);

  return (
    <>
      <section aria-labelledby="rs-h" style={{ background: '#fff' }}>
        <div className="wrap stack" style={{ gap: 24, paddingBlock: 'clamp(40px,6vw,88px) clamp(40px,5vw,64px)' }}>
          <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Learning Resources' }]} />
          <h1 id="rs-h" className="display rv d1">
            Explore. <span style={{ color: 'var(--blue-d)' }}>Discover.</span> <span className="serif" style={{ fontWeight: 400 }}>Keep Learning.</span>
          </h1>
          <div className="between rv d2" style={{ alignItems: 'flex-end' }}>
            <p className="lead">Educational articles, learning guides and parent resources from The Learning Loft — for curious students and the families who support them.</p>
            {anyPlaceholder && <Ph>Article content to be supplied by the center</Ph>}
          </div>
        </div>
      </section>

      {f && (
        <section aria-labelledby="ft-h" style={{ paddingInline: 'clamp(12px,2vw,24px)' }}>
          <article className="feat sr">
            <Frame src={f.cover} alt="" tone={toneClass(f.tone)} kenBurns priority style={{ borderRadius: 0, minHeight: 360 }} caption={f.isPlaceholder ? 'Cover image' : undefined} />
            <div className="stack" style={{ gap: 20, padding: 'clamp(28px,4vw,56px)', justifyContent: 'center' }}>
              <p className="eyebrow" style={{ color: '#FCEBB5' }}>Featured · {f.category}</p>
              <h2 id="ft-h" className="h2" style={{ color: '#fff' }}>{f.title}</h2>
              {f.summary && <p style={{ color: '#C8D3DE', fontStyle: isBracketed(f.summary) ? 'italic' : 'normal' }}>{f.summary}</p>}
              {f.publishedOn && <p className="small" style={{ color: '#C8D3DE' }}>{formatDate(f.publishedOn)}</p>}
              <div><Link className="btn btn-accent" href={`/resources/${f.slug}`}>Read Article</Link></div>
            </div>
          </article>
        </section>
      )}

      <section id="library" className="sec" aria-labelledby="lib-h">
        <div className="wrap">
          {categories.error || page.error ? (
            <ErrorState message="The resource library couldn’t be loaded right now. Please refresh or try again shortly." />
          ) : (
            <ResourceLibrary categories={categories.data!} initialPage={page.data!} initial={initial} />
          )}
        </div>
      </section>

      <section className="sec-s" aria-labelledby="rc-h">
        <div className="wrap between" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
            <h2 id="rc-h" className="h2">Ready to go beyond reading?</h2>
            <p className="muted">Explore programs at The Learning Loft or ask our team a question.</p>
          </div>
          <div className="row stack-sm">
            <Link className="btn btn-primary" href="/programs">Explore Programs</Link>
            <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
