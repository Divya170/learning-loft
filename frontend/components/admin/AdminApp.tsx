'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Alert, LogoMark } from '@/components/Icons';
import { api, ApiError } from '@/lib/api';
import type { AdminStats } from '@/lib/types';
import { CONTENT } from './config';
import ContentManager from './ContentManager';
import SettingsForm from './SettingsForm';
import SubmissionsManager from './SubmissionsManager';

const KEY = 'loft.admin.token';
type Tab = 'dashboard' | 'inquiries' | 'messages' | 'settings' | string;

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    try { setToken(sessionStorage.getItem(KEY)); } catch { /* storage unavailable */ }
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
    setToken(null);
  }, []);

  /** Wraps admin API calls: adds the token and signs out on 401. */
  const call = useCallback(
    async <T,>(path: string, opts: Parameters<typeof api>[1] = {}) => {
      try {
        return await api<T>(path, { ...opts, token: token ?? undefined });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) logout();
        throw e;
      }
    },
    [token, logout],
  );

  if (!ready) return null;
  if (!token) return <Login onToken={(t) => { try { sessionStorage.setItem(KEY, t); } catch { /* ignore */ } setToken(t); }} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'inquiries', label: 'Enrollment inquiries' },
    { id: 'messages', label: 'Contact messages' },
    ...CONTENT.map((c) => ({ id: c.resource, label: c.title })),
    { id: 'settings', label: 'Site details' },
  ];
  const content = CONTENT.find((c) => c.resource === tab);

  return (
    <>
      <header className="admin-top">
        <div className="wrap between" style={{ alignItems: 'center', paddingTop: 12, maxWidth: 1360 }}>
          <span className="logo"><LogoMark size={38} /><span><b>The Learning Loft</b><small>Admin dashboard</small></span></span>
          <div className="row" style={{ gap: 10 }}>
            <Link className="btn btn-secondary btn-sm" href="/" target="_blank">View website</Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
        <nav className="wrap admin-nav" aria-label="Admin sections" style={{ maxWidth: 1360 }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
      </header>
      <main id="main" className="wrap" style={{ maxWidth: 1360, paddingBlock: 32 }}>
        {tab === 'dashboard' && <Dashboard call={call} go={setTab} />}
        {tab === 'inquiries' && <SubmissionsManager key="inq" kind="inquiries" call={call} />}
        {tab === 'messages' && <SubmissionsManager key="msg" kind="messages" call={call} />}
        {tab === 'settings' && <SettingsForm call={call} />}
        {content && <ContentManager key={content.resource} config={content} call={call} />}
      </main>
    </>
  );
}

export type Call = <T>(path: string, opts?: Parameters<typeof api>[1]) => Promise<T>;

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) { setError('Enter the admin token.'); return; }
    setBusy(true);
    setError('');
    try {
      await api('/auth/verify', { method: 'POST', token: value.trim() });
      onToken(value.trim());
    } catch (err) {
      setError(err instanceof ApiError ? (err.status === 401 ? 'That token isn’t correct.' : err.message) : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="wrap-n" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form onSubmit={submit} noValidate className="card stack" style={{ gap: 20, width: '100%', maxWidth: 440, padding: 36, boxShadow: 'var(--sh)' }}>
        <span className="logo"><LogoMark /><span><b>The Learning Loft</b><small>Admin dashboard</small></span></span>
        <h1 className="h3">Sign in</h1>
        <div className="field">
          <label className="label" htmlFor="token">Admin token</label>
          <input id="token" className="input" type="password" autoComplete="current-password" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'token-err' : 'token-hint'} />
          {error ? <p className="err" id="token-err"><Alert size={16} />{error}</p> : <p className="hint" id="token-hint">Set as ADMIN_TOKEN in backend/.env.</p>}
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

function Dashboard({ call, go }: { call: Call; go: (t: Tab) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    call<AdminStats>('/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, [call]);

  if (error) return <div className="notice n-err" role="alert"><Alert color="#B42318" /><p>{error}</p></div>;
  if (!stats) return <div className="auto">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}</div>;

  const cards: { label: string; value: number; note?: string; tab: Tab }[] = [
    { label: 'New enrollment inquiries', value: stats.inquiries.new ?? 0, note: `${stats.inquiries.total} total`, tab: 'inquiries' },
    { label: 'New contact messages', value: stats.messages.new ?? 0, note: `${stats.messages.total} total`, tab: 'messages' },
    { label: 'Published programs', value: stats.programs, tab: 'programs' },
    { label: 'Published instructors', value: stats.instructors, tab: 'instructors' },
    { label: 'Published resources', value: stats.resources, tab: 'resources' },
    { label: 'Upcoming events', value: stats.upcomingEvents, tab: 'events' },
  ];
  return (
    <div className="stack" style={{ gap: 28 }}>
      <h1 className="h2">Overview</h1>
      {stats.placeholders > 0 && (
        <div className="notice n-warn">
          <Alert color="#7A5A00" />
          <p className="small"><b>{stats.placeholders} placeholder items</b> are still live (programs, instructors, articles, FAQs, requirements). Replace them with approved content and untick “Placeholder content”.</p>
        </div>
      )}
      <div className="auto" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap: 16 }}>
        {cards.map((c) => (
          <button key={c.label} type="button" className="stat hov" style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }} onClick={() => go(c.tab)}>
            <span className="small muted">{c.label}</span>
            <b>{c.value}</b>
            {c.note && <span className="xs muted">{c.note}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
