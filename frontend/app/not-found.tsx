import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="wrap-n state" style={{ minHeight: '70vh', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/art/art-explore.svg" alt="" width={220} height={165} />
      <p className="eyebrow">Page not found</p>
      <h1 className="h1">This page wandered off.</h1>
      <p className="lead">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="row stack-sm" style={{ justifyContent: 'center' }}>
        <Link className="btn btn-primary" href="/">Back to Home</Link>
        <Link className="btn btn-secondary" href="/programs">Explore Programs</Link>
      </div>
    </main>
  );
}
