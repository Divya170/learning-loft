/**
 * Client-side checks for instant, inline feedback. They mirror the API's rules,
 * but the NestJS API remains the source of truth — its field errors are shown the same way.
 */
export type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneError(phone: string, requiredFor?: string): string | undefined {
  const v = phone.trim();
  if (!v) return requiredFor ? `Add a phone number so we can reach you by ${requiredFor.toLowerCase()}.` : undefined;
  if (!/^[0-9+().\-\s]+$/.test(v)) return 'Use digits and + ( ) - only.';
  const n = v.replace(/\D/g, '').length;
  if (n < 10 || n > 15) return 'Enter a phone number with area code (10–15 digits).';
  return undefined;
}

export interface InquiryForm {
  parentName: string;
  email: string;
  phone: string;
  studentFirstName: string;
  studentAge: string;
  programId: string;
  contactMethod: string;
  message: string;
  consent: boolean;
  website: string;
}

export function validateInquiry(f: InquiryForm): Errors {
  const e: Errors = {};
  if (!f.parentName.trim()) e.parentName = 'Enter the parent or guardian name.';
  if (!f.email.trim()) e.email = 'Enter an email address.';
  else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email, like name@example.com.';
  const p = phoneError(f.phone, f.contactMethod !== 'Email' ? f.contactMethod : undefined);
  if (p) e.phone = p;
  if (!f.studentFirstName.trim()) e.studentFirstName = "Enter the student's first name.";
  if (!f.studentAge.trim()) e.studentAge = "Enter the student's age or grade.";
  if (f.message.length > 1000) e.message = 'Keep additional information under 1,000 characters.';
  if (!f.consent) e.consent = 'Please agree to be contacted so we can respond.';
  return e;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  consent: boolean;
  website: string;
}

export function validateContact(f: ContactForm): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Enter your full name.';
  if (!f.email.trim()) e.email = 'Enter an email address.';
  else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email, like name@example.com.';
  const p = phoneError(f.phone);
  if (p) e.phone = p;
  if (!f.inquiryType) e.inquiryType = 'Choose an inquiry type.';
  if (f.message.trim().length < 10) e.message = 'Write a message of at least 10 characters.';
  else if (f.message.length > 1500) e.message = 'Keep your message under 1,500 characters.';
  if (!f.consent) e.consent = 'Please agree to be contacted so we can reply.';
  return e;
}
