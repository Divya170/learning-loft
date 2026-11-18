'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="wrap-n state" style={{ minHeight: '60vh', justifyContent: 'center' }}>
      <p className="eyebrow">Something went wrong</p>
      <h1 className="h2">We couldn&apos;t load this page.</h1>
      <p className="lead">Please try again. If the problem continues, call or email the center directly.</p>
      <div className="row stack-sm" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
        <Link className="btn btn-secondary" href="/">Back to Home</Link>
      </div>
    </div>
  );
}
