'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert, Search } from '@/components/Icons';
import { ApiError, qs } from '@/lib/api';
import type { ContactMessage, Inquiry, Paged } from '@/lib/types';
import type { Call } from './AdminApp';

type Kind = 'inquiries' | 'messages';
type Row = Inquiry | ContactMessage;
const STATUSES: Record<Kind, string[]> = { inquiries: ['new', 'contacted', 'closed'], messages: ['new', 'replied', 'closed'] };

export default function SubmissionsManager({ kind, call }: { kind: Kind; call: Call }) {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<Row> | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(() => {
    setError('');
    call<Paged<Row>>(`/admin/${kind}${qs({ status, q, page, pageSize: 20 })}`).then(setData).catch((e) => setError(e.message));
  }, [call, kind, status, q, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);
  useEffect(() => setPage(1), [status, q]);

  async function patch(id: number, body: Record<string, string>) {
    try {
      const updated = await call<Row>(`/admin/${kind}/${id}`, { method: 'PATCH', body });
      setData((d) => (d ? { ...d, items: d.items.map((r) => (r.id === id ? updated : r)) } : d));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Update failed.');
    }
  }
  async function remove(id: number) {
    try {
      await call(`/admin/${kind}/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Delete failed.');
    }
  }

  const title = kind === 'inquiries' ? 'Enrollment inquiries' : 'Contact messages';
  return (
    <div className="stack" style={{ gap: 20 }}>
      <h1 className="h2">{title}</h1>
      <div className="row" style={{ gap: 12 }}>
        <div className="search" style={{ flex: '1 1 280px', maxWidth: 420 }}>
          <label className="sr-only" htmlFor="sm-q">Search {title}</label>
          <Search />
          <input id="sm-q" className="input input-sm" style={{ paddingLeft: 50 }} type="search" placeholder="Search name, email or reference" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips" role="group" aria-label="Filter by status">
          {['', ...STATUSES[kind]].map((s) => (
            <button key={s || 'all'} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>{s ? s[0].toUpperCase() + s.slice(1) : 'All'}</button>
          ))}
        </div>
      </div>
      {error && <div className="notice n-err" role="alert"><Alert color="#B42318" /><p className="small">{error}</p></div>}
      {!data ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : data.items.length === 0 ? (
        <div className="state" style={{ background: '#fff', border: '1px solid var(--line)' }}>
          <h2 className="h3">{q || status ? 'Nothing matches these filters' : `No ${title.toLowerCase()} yet`}</h2>
          <p className="muted small">New submissions from the website appear here.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th scope="col">Received</th><th scope="col">From</th><th scope="col">{kind === 'inquiries' ? 'Student & program' : 'Topic'}</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <RowView key={r.id} row={r} kind={kind} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} onPatch={(b) => patch(r.id, b)}
                    confirming={confirmId === r.id} onAskDelete={() => setConfirmId(r.id)} onCancelDelete={() => setConfirmId(null)} onDelete={() => remove(r.id)} />
                ))}
              </tbody>
            </table>
          </div>
          {data.pageCount > 1 && (
            <div className="pager">
              <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="small">Page {data.page} of {data.pageCount}</span>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page >= data.pageCount} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RowView({ row, kind, open, onToggle, onPatch, confirming, onAskDelete, onCancelDelete, onDelete }: {
  row: Row; kind: Kind; open: boolean; onToggle: () => void; onPatch: (b: Record<string, string>) => void;
  confirming: boolean; onAskDelete: () => void; onCancelDelete: () => void; onDelete: () => void;
}) {
  const [notes, setNotes] = useState(row.notes);
  const isInq = kind === 'inquiries';
  const inq = row as Inquiry;
  const msg = row as ContactMessage;
  const name = isInq ? inq.parentName : msg.name;
  const received = new Date(row.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <tr>
        <td style={{ whiteSpace: 'nowrap' }}><span className="small">{received}</span><div className="xs muted">{row.reference}</div></td>
        <td><b>{name}</b><div className="xs"><a href={`mailto:${row.email}`}>{row.email}</a>{row.phone && <> · <a href={`tel:${row.phone}`}>{row.phone}</a></>}</div></td>
        <td>{isInq ? <>{inq.studentFirstName} ({inq.studentAge})<div className="xs muted">{inq.programName || 'Not sure yet'} · prefers {inq.contactMethod.toLowerCase()}</div></> : msg.inquiryType}</td>
        <td>
          <label className="sr-only" htmlFor={`st-${row.id}`}>Status for {row.reference}</label>
          <select id={`st-${row.id}`} className="input input-sm" style={{ width: 'auto' }} value={row.status} onChange={(e) => onPatch({ status: e.target.value })}>
            {STATUSES[kind].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </td>
        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {confirming ? (
            <span className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-sm" style={{ background: 'var(--err)', color: '#fff' }} onClick={onDelete}>Yes, delete</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onCancelDelete}>Cancel</button>
            </span>
          ) : (
            <span className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" aria-expanded={open} onClick={onToggle}>{open ? 'Hide' : 'View'}</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onAskDelete} aria-label={`Delete ${row.reference}`}>Delete</button>
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: '#FAFBFD' }}>
            <div className="cols-2" style={{ gap: 20 }}>
              <div className="stack" style={{ gap: 6 }}>
                <b className="h4">{isInq ? 'Additional information' : 'Message'}</b>
                <p className="small" style={{ whiteSpace: 'pre-line' }}>{row.message || '—'}</p>
              </div>
              <div className="field">
                <label className="label" htmlFor={`nt-${row.id}`}>Internal notes</label>
                <textarea id={`nt-${row.id}`} className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <div><button type="button" className="btn btn-primary btn-sm" disabled={notes === row.notes} onClick={() => onPatch({ notes })}>Save notes</button></div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
