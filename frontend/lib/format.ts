import type { Tone } from './types';

const TONE_CLASS: Record<string, string> = { sky: 'f-sky', lav: 'f-lav', cream: 'f-cream', yel: 'f-yel', white: 'f-white' };
export const toneClass = (tone?: string) => TONE_CLASS[tone ?? 'sky'] ?? 'f-sky';

const TAG_CLASS: Record<string, string> = { lav: 'lav', cream: 'cr', yel: 'cr' };
export const tagClass = (tone?: Tone | string) => TAG_CLASS[tone ?? ''] ?? '';

/** Placeholder content is written in [square brackets]. */
export const isBracketed = (s?: string | null) => !!s && /^\[.*\]$/.test(s.trim());

export function formatDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', opts);
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function dateTile(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { mon: '—', day: '—' };
  return { mon: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: String(d.getDate()) };
}

/** Splits article bodies: blank lines separate paragraphs, "## " starts a heading. */
export function bodyBlocks(body = ''): { type: 'h' | 'p'; text: string }[] {
  return body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith('## ') ? { type: 'h' as const, text: b.slice(3) } : { type: 'p' as const, text: b }));
}
