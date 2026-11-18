'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Alert, Plus, Search } from '@/components/Icons';
import Sheet from '@/components/Sheet';
import { ApiError, qs } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Call } from './AdminApp';
import { ART, type ContentConfig, toForm, toPayload } from './config';

type Item = Record<string, unknown> & { id: number };

export default function ContentManager({ config, call }: { config: ContentConfig; call: Call }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setError('');
    call<Item[]>(`/admin/${config.resource}${qs({ q })}`).then(setItems).catch((e) => setError(e.message));
  }, [call, config.resource, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(id: number) {
    try {
      await call(`/admin/${config.resource}/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      setNotice(`The ${config.singular} was deleted.`);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Delete failed.');
    }
  }

  const show = (item: Item, key: string) => {
    const v = item[key];
    if (key === 'startAt' || key === 'publishedOn') return v ? formatDate(String(v)) : 'No date';
    return typeof v === 'string' ? v : '';
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="between" style={{ alignItems: 'center' }}>
        <h1 className="h2">{config.title}</h1>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><Plus />Add {config.singular}</button>
      </div>
      <div className="search" style={{ maxWidth: 420 }}>
        <label className="sr-only" htmlFor="cm-q">Search {config.title}</label>
        <Search />
        <input id="cm-q" className="input input-sm" style={{ paddingLeft: 50 }} type="search" placeholder={`Search ${config.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {notice && <div className="notice n-ok" role="status"><p className="small">{notice}</p><button type="button" className="link-arrow" style={{ marginLeft: 'auto', minHeight: 0 }} onClick={() => setNotice('')}>Dismiss</button></div>}
      {error && <div className="notice n-err" role="alert"><Alert color="#B42318" /><p className="small">{error}</p></div>}

      {!items ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : items.length === 0 ? (
        <div className="state" style={{ background: '#fff', border: '1px solid var(--line)' }}>
          <h2 className="h3">{q ? 'Nothing matches your search' : `No ${config.title.toLowerCase()} yet`}</h2>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>Add {config.singular}</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th scope="col">{config.fields.find((f) => f.key === config.primary)?.label}</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <b>{show(it, config.primary)}</b>
                    {config.secondary && <div className="xs muted" style={{ marginTop: 4, maxWidth: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{config.secondary.map((k) => show(it, k)).filter(Boolean).join(' · ')}</div>}
                  </td>
                  <td>
                    {'published' in it && <span className={`badge ${it.published ? 'ok' : 'off'}`}>{it.published ? 'Published' : 'Hidden'}</span>}
                    {Boolean(it.isPlaceholder) && <span className="badge new">Placeholder</span>}
                    {Boolean(it.featured) && <span className="badge blue">Featured</span>}
                    {'consentConfirmed' in it && !it.consentConfirmed && <span className="badge off">No consent</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {confirmId === it.id ? (
                      <span className="row" style={{ gap: 8, justifyContent: 'flex-end' }} role="group" aria-label="Confirm delete">
                        <span className="small">Delete?</span>
                        <button type="button" className="btn btn-sm" style={{ background: 'var(--err)', color: '#fff' }} onClick={() => remove(it.id)}>Yes, delete</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                      </span>
                    ) : (
                      <span className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(it)}>Edit</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmId(it.id)} aria-label={`Delete ${show(it, config.primary)}`}>Delete</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Editor
          config={config}
          item={editing === 'new' ? null : editing}
          call={call}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); setNotice(msg); load(); }}
        />
      )}
    </div>
  );
}

function Editor({ config, item, call, onClose, onSaved }: { config: ContentConfig; item: Item | null; call: Call; onClose: () => void; onSaved: (msg: string) => void }) {
  const [form, setForm] = useState(() => toForm(config.fields, item ?? config.defaults));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    const missing: Record<string, string> = {};
    for (const f of config.fields) if (f.required && !String(form[f.key] ?? '').trim()) missing[f.key] = `${f.label} is required.`;
    setErrors(missing);
    if (Object.keys(missing).length) { setMessage('Please fill in the required fields.'); return; }
    setSaving(true);
    setMessage('');
    try {
      const body = toPayload(config.fields, form, !!item);
      if (item) await call(`/admin/${config.resource}/${item.id}`, { method: 'PATCH', body });
      else await call(`/admin/${config.resource}`, { method: 'POST', body });
      onSaved(item ? `Changes to the ${config.singular} were saved.` : `The ${config.singular} was created.`);
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.errors); setMessage(err.message); }
      else setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet labelledBy="ed-title" onClose={onClose} closeLabel="Close editor" header={<b id="ed-title" className="h4">{item ? `Edit ${config.singular}` : `New ${config.singular}`}</b>}>
      <form onSubmit={save} noValidate className="form" style={{ padding: 24 }}>
        {message && <div className="notice n-err full" role="alert"><Alert color="#B42318" /><p className="small">{message}</p></div>}
        {config.fields.map((f) => {
          const id = `cf-${f.key}`;
          const err = errors[f.key];
          const common = { id, 'aria-invalid': !!err, 'aria-describedby': err ? `${id}-e` : f.hint ? `${id}-h` : undefined };
          const v = form[f.key];
          const setV = (val: string | boolean) => setForm((p) => ({ ...p, [f.key]: val }));
          if (f.type === 'checkbox')
            return (
              <div key={f.key} className="field full">
                <label className="check" htmlFor={id}><input type="checkbox" checked={!!v} onChange={(e) => setV(e.target.checked)} {...common} /><span className="small">{f.label}</span></label>
                {err && <p className="err" id={`${id}-e`}>{err}</p>}
              </div>
            );
          return (
            <div key={f.key} className={`field ${f.full || f.type === 'textarea' || f.type === 'lines' ? 'full' : ''}`}>
              <label className="label" htmlFor={id}>{f.label}{f.required && <span className="req" aria-hidden="true">*</span>}</label>
              {f.type === 'textarea' || f.type === 'lines' ? (
                <textarea className="input" rows={f.rows ?? 4} value={String(v ?? '')} onChange={(e) => setV(e.target.value)} {...common} />
              ) : f.type === 'select' ? (
                <select className="input" value={String(v ?? '')} onChange={(e) => setV(e.target.value)} {...common}>
                  {!f.required && <option value="">—</option>}
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className="input"
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                  list={f.type === 'image' ? 'art-list' : undefined}
                  value={String(v ?? '')}
                  onChange={(e) => setV(e.target.value)}
                  {...common}
                />
              )}
              {err ? <p className="err" id={`${id}-e`}><Alert size={16} />{err}</p> : f.hint && <p className="hint" id={`${id}-h`}>{f.hint}</p>}
            </div>
          );
        })}
        <datalist id="art-list">{ART.map((a) => <option key={a} value={a} />)}</datalist>
        <div className="full row" style={{ gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} aria-busy={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Sheet>
  );
}
