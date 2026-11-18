'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/Icons';
import SuccessCard from '@/components/SuccessCard';
import { FieldError } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { MessageReceipt } from '@/lib/types';
import { type ContactForm as Form, type Errors, validateContact } from '@/lib/validation';

const TOPICS = ['Programs', 'Enrollment', 'Instructors', 'Events', 'Learning resources', 'Something else'];
const LABELS: Record<string, string> = { name: 'Full name', email: 'Email address', phone: 'Phone number', inquiryType: 'Inquiry type', message: 'Message', consent: 'Consent' };
const empty = (topic = ''): Form => ({ name: '', email: '', phone: '', inquiryType: TOPICS.includes(topic) ? topic : '', message: '', consent: false, website: '' });

export default function ContactForm({ initialTopic, privacyUrl }: { initialTopic: string; privacyUrl: string }) {
  const [f, setF] = useState<Form>(empty(initialTopic));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ message: string; reference?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<(MessageReceipt & { name: string }) | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  const clientErrors = validateContact(f);
  const errorFor = (k: string) => serverErrors[k] ?? ((attempted || touched[k]) ? clientErrors[k] : undefined);
  const visible = Object.keys(LABELS).filter((k) => errorFor(k));

  useEffect(() => { if (receipt) successRef.current?.focus(); }, [receipt]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (serverErrors[k]) setServerErrors(({ [k]: _d, ...rest }) => rest);
  };
  const field = (k: string) => ({
    id: `c-${k}`,
    name: k,
    'aria-invalid': !!errorFor(k),
    'aria-describedby': [errorFor(k) ? `ce-${k}` : '', k === 'message' ? 'ch-message' : ''].filter(Boolean).join(' ') || undefined,
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);
    setBanner(null);
    if (Object.keys(clientErrors).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await api<MessageReceipt>('/contact', {
        method: 'POST',
        body: { name: f.name, email: f.email, phone: f.phone || undefined, inquiryType: f.inquiryType, message: f.message, consent: f.consent, website: f.website || undefined },
      });
      setReceipt({ ...res, name: f.name });
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.errors).length) { setServerErrors(err.errors); requestAnimationFrame(() => summaryRef.current?.focus()); }
        setBanner({ message: err.message, reference: err.reference });
      } else setBanner({ message: 'Something went wrong. Please try again.' });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div ref={successRef} tabIndex={-1} style={{ outline: 'none' }}>
        <SuccessCard
          title={`Message received — thanks, ${receipt.name}!`}
          reference={receipt.reference}
          actions={[
            { label: 'Explore Programs', href: '/programs' },
            { label: 'Start an Enrollment Inquiry', href: '/admissions#inquiry', variant: 'secondary' },
          ]}
          onReset={() => { setF(empty()); setTouched({}); setAttempted(false); setReceipt(null); setBanner(null); }}
          resetLabel="Write another message"
        >
          <p className="lead" style={{ fontSize: '1.05rem' }}>Your <b>{receipt.inquiryType.toLowerCase()}</b> question is with our team. We&apos;ll reply to the email address you gave us.</p>
        </SuccessCard>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="form">
      <p className="small muted full">Fields marked <span className="req" aria-hidden="true">*</span> are required.</p>

      {banner && !visible.length && (
        <div className={`notice full ${banner.reference ? 'n-info' : 'n-err'}`} role="alert">
          <Alert size={22} color={banner.reference ? 'var(--blue-dd)' : '#B42318'} />
          <div className="stack small" style={{ gap: 6 }}>
            <b>{banner.message}</b>
            {banner.reference && <span>Reference: <b>{banner.reference}</b></span>}
          </div>
        </div>
      )}
      {visible.length > 0 && attempted && (
        <div className="notice n-err err-sum full" role="alert" tabIndex={-1} ref={summaryRef}>
          <Alert size={22} color="#B42318" />
          <div className="stack" style={{ gap: 6 }}>
            <b className="h4">Please check {visible.length} field{visible.length > 1 ? 's' : ''}</b>
            <ul className="small" style={{ paddingLeft: 18 }}>
              {visible.map((k) => <li key={k}><a href={`#c-${k}`}>{LABELS[k]}: {errorFor(k)}</a></li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="c-name">Full name<span className="req" aria-hidden="true">*</span></label>
        <input className="input" type="text" autoComplete="name" maxLength={120} value={f.name} onChange={(e) => set('name', e.target.value)} {...field('name')} />
        <FieldError id="ce-name" message={errorFor('name')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-email">Email address<span className="req" aria-hidden="true">*</span></label>
        <input className="input" type="email" inputMode="email" autoComplete="email" maxLength={160} value={f.email} onChange={(e) => set('email', e.target.value)} {...field('email')} />
        <FieldError id="ce-email" message={errorFor('email')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-phone">Phone number<span className="opt">(optional)</span></label>
        <input className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...field('phone')} />
        <FieldError id="ce-phone" message={errorFor('phone')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-inquiryType">Inquiry type<span className="req" aria-hidden="true">*</span></label>
        <select className="input" value={f.inquiryType} onChange={(e) => set('inquiryType', e.target.value)} {...field('inquiryType')}>
          <option value="">Choose a topic</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <FieldError id="ce-inquiryType" message={errorFor('inquiryType')} />
      </div>
      <div className="field full">
        <label className="label" htmlFor="c-message">Message<span className="req" aria-hidden="true">*</span></label>
        <textarea className="input" rows={6} maxLength={1500} value={f.message} onChange={(e) => set('message', e.target.value)} {...field('message')} />
        <FieldError id="ce-message" message={errorFor('message')} />
        <p className="hint" id="ch-message">Please don&apos;t include sensitive personal details. {1500 - f.message.length} characters left.</p>
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-website">Leave this field empty</label>
        <input id="c-website" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} />
      </div>
      <div className="field full">
        <label className="check" htmlFor="c-consent">
          <input type="checkbox" checked={f.consent} onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} {...field('consent')} />
          <span className="small">
            I agree to be contacted by The Learning Loft about my message.<span className="req" aria-hidden="true">*</span>{' '}
            {privacyUrl ? <a href={privacyUrl}>Privacy policy</a> : <span className="phc">[Privacy policy link — to be supplied]</span>}
          </span>
        </label>
        <FieldError id="ce-consent" message={errorFor('consent')} />
      </div>
      <div className="full row stack-sm">
        <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
          {submitting ? <><span className="spin" aria-hidden="true" />Sending…</> : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
