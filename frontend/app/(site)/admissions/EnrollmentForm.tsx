'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/Icons';
import SuccessCard from '@/components/SuccessCard';
import { FieldError } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { InquiryReceipt, ProgramOption } from '@/lib/types';
import { type Errors, type InquiryForm, validateInquiry } from '@/lib/validation';

const CONTACT_METHODS = ['Email', 'Phone call', 'Text message'];
const LABELS: Record<string, string> = {
  parentName: 'Parent/Guardian name',
  email: 'Email address',
  phone: 'Phone number',
  studentFirstName: 'Student first name',
  studentAge: 'Student age or grade',
  programId: 'Interested program',
  contactMethod: 'Preferred contact method',
  message: 'Additional information',
  consent: 'Consent to be contacted',
};
const EMPTY: InquiryForm = { parentName: '', email: '', phone: '', studentFirstName: '', studentAge: '', programId: '', contactMethod: 'Email', message: '', consent: false, website: '' };

export default function EnrollmentForm({
  programs,
  programsUnavailable,
  initialProgramId,
  privacyUrl,
}: {
  programs: ProgramOption[];
  programsUnavailable: boolean;
  initialProgramId: string;
  privacyUrl: string;
}) {
  const validInitial = programs.some((p) => String(p.id) === initialProgramId) ? initialProgramId : '';
  const [f, setF] = useState<InquiryForm>({ ...EMPTY, programId: validInitial });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ message: string; reference?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<(InquiryReceipt & { parentName: string }) | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  const clientErrors = validateInquiry(f);
  const errorFor = (k: string) => serverErrors[k] ?? ((attempted || touched[k]) ? clientErrors[k] : undefined);
  const visibleErrors = Object.keys(LABELS).filter((k) => errorFor(k));

  useEffect(() => { if (receipt) successRef.current?.focus(); }, [receipt]);

  const set = <K extends keyof InquiryForm>(k: K, v: InquiryForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (serverErrors[k]) setServerErrors(({ [k]: _drop, ...rest }) => rest);
  };
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const field = (k: string) => ({
    id: `f-${k}`,
    name: k,
    'aria-invalid': !!errorFor(k),
    'aria-describedby': [errorFor(k) ? `e-${k}` : '', `h-${k}`].filter(Boolean).join(' ') || undefined,
    onBlur: blur(k),
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return; // duplicate-submission guard
    setAttempted(true);
    setBanner(null);
    if (Object.keys(clientErrors).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await api<InquiryReceipt>('/inquiries', {
        method: 'POST',
        body: {
          parentName: f.parentName,
          email: f.email,
          phone: f.phone || undefined,
          studentFirstName: f.studentFirstName,
          studentAge: f.studentAge,
          programId: f.programId ? Number(f.programId) : null,
          contactMethod: f.contactMethod,
          message: f.message || undefined,
          consent: f.consent,
          website: f.website || undefined,
        },
      });
      setReceipt({ ...res, parentName: f.parentName });
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.errors).length) {
          setServerErrors(err.errors);
          requestAnimationFrame(() => summaryRef.current?.focus());
        }
        setBanner({ message: err.message, reference: err.reference });
      } else setBanner({ message: 'Something went wrong. Please try again.' });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const reset = () => { setF(EMPTY); setTouched({}); setAttempted(false); setServerErrors({}); setBanner(null); setReceipt(null); };

  if (receipt) {
    return (
      <div ref={successRef} tabIndex={-1} style={{ outline: 'none' }}>
        <SuccessCard
          title={`Inquiry received — thank you, ${receipt.parentName}!`}
          reference={receipt.reference}
          actions={[
            { label: 'Explore Programs', href: '/programs' },
            { label: 'Browse Learning Resources', href: '/resources', variant: 'secondary' },
          ]}
          onReset={reset}
          resetLabel="Start a new inquiry"
        >
          <p className="lead" style={{ fontSize: '1.05rem' }}>
            Our team will be in touch by <b>{receipt.contactMethod.toLowerCase()}</b>
            {receipt.programName ? <> about <b>{receipt.programName}</b></> : null}. Keep your reference handy if you call us.
          </p>
          <div className="notice n-info">
            <Alert size={22} color="var(--blue-dd)" />
            <p className="small">An inquiry isn&apos;t a confirmed admission. Registration is completed with the center after we&apos;ve talked through your student&apos;s needs.</p>
          </div>
        </SuccessCard>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="stack" style={{ gap: 28 }} aria-describedby="req-note">
      <p id="req-note" className="small muted">Fields marked <span className="req" aria-hidden="true">*</span> are required.</p>

      {banner && !visibleErrors.length && (
        <div className={`notice ${banner.reference ? 'n-info' : 'n-err'}`} role="alert">
          <Alert size={22} color={banner.reference ? 'var(--blue-dd)' : '#B42318'} />
          <div className="stack small" style={{ gap: 6 }}>
            <b>{banner.message}</b>
            {banner.reference && <span>Your earlier reference: <b>{banner.reference}</b></span>}
          </div>
        </div>
      )}

      {visibleErrors.length > 0 && attempted && (
        <div className="notice n-err err-sum" role="alert" tabIndex={-1} ref={summaryRef}>
          <Alert size={22} color="#B42318" />
          <div className="stack" style={{ gap: 8 }}>
            <b className="h4">Please check {visibleErrors.length} field{visibleErrors.length > 1 ? 's' : ''}</b>
            <ul className="stack small" style={{ gap: 4, paddingLeft: 18 }}>
              {visibleErrors.map((k) => (
                <li key={k}><a href={`#f-${k}`}>{LABELS[k]}: {errorFor(k)}</a></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <fieldset className="form" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 18, padding: 0 }}>Parent or guardian</legend>
        <div className="field full">
          <label className="label" htmlFor="f-parentName">Parent/Guardian name<span className="req" aria-hidden="true">*</span></label>
          <input className="input" type="text" autoComplete="name" required maxLength={120} value={f.parentName} onChange={(e) => set('parentName', e.target.value)} {...field('parentName')} />
          <FieldError id="e-parentName" message={errorFor('parentName')} />
        </div>
        <div className="field">
          <label className="label" htmlFor="f-email">Email address<span className="req" aria-hidden="true">*</span></label>
          <input className="input" type="email" inputMode="email" autoComplete="email" required maxLength={160} value={f.email} onChange={(e) => set('email', e.target.value)} {...field('email')} />
          <FieldError id="e-email" message={errorFor('email')} />
        </div>
        <div className="field">
          <label className="label" htmlFor="f-phone">Phone number<span className="opt">{f.contactMethod === 'Email' ? '(optional)' : '(required for calls/texts)'}</span></label>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...field('phone')} />
          <FieldError id="e-phone" message={errorFor('phone')} />
          <p className="hint" id="h-phone">Include area code, e.g. (805) 555-0100.</p>
        </div>
      </fieldset>

      <fieldset className="form" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 18, padding: 0 }}>Student</legend>
        <div className="field">
          <label className="label" htmlFor="f-studentFirstName">Student first name<span className="req" aria-hidden="true">*</span></label>
          <input className="input" type="text" autoComplete="off" required maxLength={60} value={f.studentFirstName} onChange={(e) => set('studentFirstName', e.target.value)} {...field('studentFirstName')} />
          <FieldError id="e-studentFirstName" message={errorFor('studentFirstName')} />
          <p className="hint" id="h-studentFirstName">A first name is all we need for now.</p>
        </div>
        <div className="field">
          <label className="label" htmlFor="f-studentAge">Student age or grade<span className="req" aria-hidden="true">*</span></label>
          <input className="input" type="text" required maxLength={40} value={f.studentAge} onChange={(e) => set('studentAge', e.target.value)} {...field('studentAge')} />
          <FieldError id="e-studentAge" message={errorFor('studentAge')} />
          <p className="hint" id="h-studentAge">For example &quot;9&quot; or &quot;4th grade&quot;. No date of birth needed.</p>
        </div>
        <div className="field full">
          <label className="label" htmlFor="f-programId">Interested program<span className="opt">(optional)</span></label>
          <select className="input" value={f.programId} onChange={(e) => set('programId', e.target.value)} {...field('programId')}>
            <option value="">Not sure yet — help me choose</option>
            {programs.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <FieldError id="e-programId" message={errorFor('programId')} />
          <p className="hint" id="h-programId" style={validInitial && f.programId === validInitial ? { color: 'var(--ok)' } : undefined}>
            {programsUnavailable
              ? 'The program list is temporarily unavailable — choose "Not sure yet" and mention it below.'
              : validInitial && f.programId === validInitial
                ? 'Selected from the Programs page — change it anytime.'
                : 'Choose a program, or let us help you decide.'}
          </p>
        </div>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
        <legend className="label" style={{ marginBottom: 12, padding: 0 }}>Preferred contact method<span className="req" aria-hidden="true">*</span></legend>
        <div className="opts">
          {CONTACT_METHODS.map((c) => (
            <label key={c} className="opt-pill">
              <input type="radio" name="contactMethod" value={c} checked={f.contactMethod === c} onChange={() => set('contactMethod', c)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="label" htmlFor="f-message">Additional information<span className="opt">(optional)</span></label>
        <textarea className="input" rows={5} maxLength={1000} value={f.message} onChange={(e) => set('message', e.target.value)} {...field('message')} />
        <FieldError id="e-message" message={errorFor('message')} />
        <p className="hint" id="h-message">Goals, questions or anything helpful to know. Please don&apos;t include medical or other sensitive details. {1000 - f.message.length} characters left.</p>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Leave this field empty</label>
        <input id="f-website" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="field">
        <label className="check" htmlFor="f-consent">
          <input type="checkbox" checked={f.consent} onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} {...field('consent')} />
          <span className="small">
            I agree to be contacted by The Learning Loft about this inquiry.<span className="req" aria-hidden="true">*</span>{' '}
            {privacyUrl ? <a href={privacyUrl}>Privacy policy</a> : <span className="phc">[Privacy policy link — to be supplied]</span>}
          </span>
        </label>
        <FieldError id="e-consent" message={errorFor('consent')} />
      </div>

      <div className="row stack-sm" style={{ justifyContent: 'space-between' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
          {submitting ? <><span className="spin" aria-hidden="true" />Sending…</> : 'Submit Enrollment Inquiry'}
        </button>
        <p className="xs muted" style={{ maxWidth: '32ch' }}>We ask only for what we need to respond to you.</p>
      </div>
    </form>
  );
}
