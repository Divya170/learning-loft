'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import { Arrow, Chevron, Close, LogoMark, Menu } from './Icons';

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About' },
  { href: '/instructors', label: 'Our Instructors' },
  { href: '/resources', label: 'Learning Resources' },
  { href: '/events', label: 'Events' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/contact', label: 'Contact' },
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));

export default function Header({ site }: { site: SiteSettings | null }) {
  const path = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Drawer: focus management, Escape to close, focus trap, scroll lock.
  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <div className="hdr-wrap">
      <header className="hdr" style={{ boxShadow: scrolled ? '0 8px 24px -18px rgba(41,55,70,.45)' : 'none', transition: 'box-shadow .3s' }}>
        <div className="wrap hdr-in" style={{ maxWidth: 1360 }}>
          <Link className="logo" href="/" aria-label={`${site?.name ?? 'The Learning Loft'} — home`}>
            <LogoMark />
            <span>
              <b>{site?.name ?? 'The Learning Loft'}</b>
              <small>Oxnard · California</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <Link className="btn btn-accent btn-sm hdr-cta" href="/admissions#inquiry">
              Enroll Now <Arrow size={16} strokeWidth={2.4} />
            </Link>
            <button
              ref={openerRef}
              type="button"
              className="menu-btn"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-drawer"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer" id="site-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
          <button type="button" className="scrim" tabIndex={-1} aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="panel" ref={panelRef}>
            <div className="between" style={{ alignItems: 'center' }}>
              <span className="logo">
                <LogoMark size={40} />
                <b>{site?.name ?? 'The Learning Loft'}</b>
              </span>
              <button ref={closeRef} type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                <Close />
              </button>
            </div>
            <nav aria-label="Main (mobile)">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                  <span>{n.label}</span>
                  <Chevron />
                </Link>
              ))}
            </nav>
            <Link className="btn btn-accent" href="/admissions#inquiry" onClick={() => setOpen(false)}>
              Start Your Enrollment Inquiry
            </Link>
            {site && (
              <div className="stack small" style={{ gap: 6, marginTop: 'auto' }}>
                <a href={`tel:${site.phoneHref}`} style={{ color: 'var(--ink)', fontWeight: 600, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
                  {site.phone}
                </a>
                <a href={`mailto:${site.email}`} style={{ color: 'var(--ink)', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
                  {site.email}
                </a>
                <span className="muted">
                  {site.street}, {site.city}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
