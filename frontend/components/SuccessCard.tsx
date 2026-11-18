import Link from 'next/link';
import type { ReactNode } from 'react';
import { Check } from './Icons';

export interface NextAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
}

/** Shown after a successful submission: confirmation, reference number and clear next actions. */
export default function SuccessCard({
  title,
  reference,
  children,
  actions,
  onReset,
  resetLabel = 'Send another',
}: {
  title: string;
  reference?: string;
  children?: ReactNode;
  actions: NextAction[];
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="success-card" role="status" aria-live="polite" tabIndex={-1}>
      <span className="ibadge" style={{ width: 64, height: 64, borderRadius: 20, background: '#EEF8F2', color: 'var(--ok)' }}>
        <Check size={30} strokeWidth={2.4} />
      </span>
      <h3 className="h2" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>{title}</h3>
      {reference && (
        <div className="stack" style={{ gap: 6 }}>
          <span className="xs muted" style={{ fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Your reference</span>
          <span className="ref">{reference}</span>
        </div>
      )}
      {children}
      <div className="row stack-sm">
        {actions.map((a) =>
          a.external ? (
            <a key={a.label} className={`btn ${a.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`} href={a.href}>{a.label}</a>
          ) : (
            <Link key={a.label} className={`btn ${a.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`} href={a.href}>{a.label}</Link>
          ),
        )}
      </div>
      {onReset && (
        <button type="button" className="link-arrow" style={{ alignSelf: 'flex-start' }} onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  );
}
