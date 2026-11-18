import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@/components/Icons';
import { Crumbs, ErrorState, Frame, Ph } from '@/components/ui';
import { load } from '@/lib/api';
import { bodyBlocks, formatDate, isBracketed, tagClass, toneClass } from '@/lib/format';
import type { Resource } from '@/lib/types';

type Params = Promise<{ slug: string }>;
type Data = { resource: Resource; related: Resource[] };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await load<Data>(`/resources/${encodeURIComponent(slug)}`);
  return data ? { title: data.resource.title, description: data.resource.summary } : { title: 'Learning Resources' };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const { data, error } = await load<Data>(`/resources/${encodeURIComponent(slug)}`);
  if (error?.status === 404) notFound();
  if (!data) {
    return (
      <div className="wrap sec">
        <ErrorState message="This article couldn’t be loaded right now." action={<Link className="link-arrow" href="/resources">Back to Learning Resources</Link>} />
      </div>
    );
  }
  const { resource: r, related } = data;
  const blocks = bodyBlocks(r.body);

  return (
    <article aria-labelledby="ar-h">
      <header style={{ background: 'var(--cream)' }}>
        <div className="wrap-n stack" style={{ gap: 22, paddingBlock: 'clamp(32px,5vw,64px) 0' }}>
          <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Learning Resources', href: '/resources' }, { label: r.title }]} />
          <span className={`tag ${tagClass(r.tone)}`}>{r.category}</span>
          <h1 id="ar-h" className="h1">{r.title}</h1>
          <div className="meta">
            {r.author ? <span>By <b>{r.author}</b></span> : r.isPlaceholder && <span className="phc">[Author, if supplied]</span>}
            {r.publishedOn ? <span>{formatDate(r.publishedOn)}</span> : r.isPlaceholder && <span className="phc">[Publication date]</span>}
            {r.readMinutes ? <span>{r.readMinutes} min read</span> : null}
          </div>
          <Frame src={r.cover} alt="" tone={toneClass(r.tone)} priority style={{ aspectRatio: '16 / 9', marginBottom: -80, boxShadow: 'var(--sh)' }} caption={r.isPlaceholder ? 'Cover image' : undefined} />
        </div>
      </header>
      <div className="wrap-n" style={{ paddingTop: 120, paddingBottom: 64 }}>
        <div className="prose">
          {r.isPlaceholder && <div style={{ marginBottom: 24 }}><Ph>Article body placeholder</Ph></div>}
          {blocks.length === 0 && <p className="muted">This article is being written. Please check back soon.</p>}
          {blocks.map((b, i) =>
            b.type === 'h' ? (
              <h2 key={i} className="h3">{b.text}</h2>
            ) : (
              <p key={i} className={isBracketed(b.text) ? 'phc' : ''}>{b.text}</p>
            ),
          )}
        </div>
        <div className="line-t" style={{ paddingTop: 28, marginTop: 20 }}>
          <Link className="link-arrow" href="/resources"><ArrowLeft />Back to Learning Resources</Link>
        </div>
      </div>
      {related.length > 0 && (
        <section className="sec-s" aria-labelledby="rel-h" style={{ background: 'var(--sky)' }}>
          <div className="wrap stack" style={{ gap: 28 }}>
            <h2 id="rel-h" className="h2" style={{ fontSize: 'clamp(1.6rem,2.6vw,2.1rem)' }}>Related resources</h2>
            <div className="cols-3">
              {related.map((x) => (
                <Link key={x.id} className="rcard" href={`/resources/${x.slug}`}>
                  <Frame src={x.cover} tone={toneClass(x.tone)} style={{ backgroundColor: '#fff' }} />
                  <span className={`tag ${tagClass(x.tone)}`}>{x.category}</span>
                  <span className="h3">{x.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
