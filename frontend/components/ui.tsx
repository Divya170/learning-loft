import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Alert, Arrow } from './Icons';

/** Yellow dashed tag marking content the center still has to supply or confirm. */
export function Ph({ children = 'Content placeholder' }: { children?: ReactNode }) {
  return <span className="ph">{children}</span>;
}

/** Renders text in the muted italic placeholder style when it is a [bracketed] placeholder. */
export function Txt({ text, as: Tag = 'p', className = '' }: { text: string; as?: 'p' | 'span' | 'dd'; className?: string }) {
  const ph = /^\[.*\]$/.test(text.trim());
  return <Tag className={`${className} ${ph ? 'phc' : ''}`.trim()}>{text}</Tag>;
}

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs rv" style={{ padding: 0, margin: 0 }}>
        {items.map((c, i) => (
          <li key={c.label} style={{ display: 'contents' }}>
            {i > 0 && <span aria-hidden="true">/</span>}
            <span>{c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ArrowLink({ href, children, className = 'link-arrow' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link className={className} href={href}>
      {children}
      <Arrow />
    </Link>
  );
}

/** Image slot with brand tone background. Illustrations stand in until real photography is supplied. */
export function Frame({
  src,
  alt = '',
  tone = 'f-sky',
  className = '',
  style,
  imgStyle,
  caption,
  zoom = false,
  kenBurns = false,
  priority = false,
}: {
  src: string;
  alt?: string;
  tone?: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  caption?: string;
  zoom?: boolean;
  kenBurns?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={`frame ${tone} ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`art ${zoom ? 'z' : ''} ${kenBurns ? 'kb' : ''}`}
        src={src}
        alt={alt}
        width={480}
        height={360}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={imgStyle}
      />
      {caption && <span className="cap">{caption}</span>}
    </div>
  );
}

export function ErrorState({ title = 'This section couldn’t load', message, action }: { title?: string; message: string; action?: ReactNode }) {
  return (
    <div className="notice n-err" role="alert">
      <Alert size={22} color="#B42318" />
      <div className="stack" style={{ gap: 6 }}>
        <b className="h4">{title}</b>
        <p className="small">{message}</p>
        {action}
      </div>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="err" id={id}>
      <Alert size={16} strokeWidth={2.4} />
      {message}
    </p>
  );
}
