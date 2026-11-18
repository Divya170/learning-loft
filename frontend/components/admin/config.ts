/** Field definitions that drive the generic content manager. */
export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'date' | 'datetime' | 'lines' | 'image';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  hint?: string;
  full?: boolean;
  rows?: number;
  nullable?: boolean;
}

export interface ContentConfig {
  resource: string; // API path under /admin
  title: string;
  singular: string;
  primary: string; // field shown as the row title
  secondary?: string[]; // fields shown under the title
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

const TONES = ['sky', 'lav', 'cream', 'yel', 'white'];
export const ART = [
  '/art/art-reading.svg', '/art/art-explore.svg', '/art/art-create.svg', '/art/art-grow.svg',
  '/art/art-together.svg', '/art/art-notebook.svg', '/art/art-calendar.svg', '/art/art-portrait.svg',
];
const flags: FieldDef[] = [
  { key: 'isPlaceholder', label: 'Placeholder content (shows a “to be supplied” tag)', type: 'checkbox' },
  { key: 'published', label: 'Published on the website', type: 'checkbox' },
];
const order: FieldDef = { key: 'sortOrder', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first.' };
const slug: FieldDef = { key: 'slug', label: 'URL slug', type: 'text', hint: 'Leave empty to generate from the name.' };
const tone: FieldDef = { key: 'tone', label: 'Image background', type: 'select', options: TONES };

export const CONTENT: ContentConfig[] = [
  {
    resource: 'programs', title: 'Programs', singular: 'program', primary: 'name', secondary: ['category', 'ageGroup'],
    defaults: { tone: 'sky', image: ART[0], published: true, isPlaceholder: false, featured: false, sortOrder: 0, objectives: [] },
    fields: [
      { key: 'name', label: 'Program name', type: 'text', required: true }, slug,
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'ageGroup', label: 'Age group / eligibility', type: 'text' },
      { key: 'level', label: 'Learning level', type: 'text' },
      { key: 'summary', label: 'Short description', type: 'textarea', full: true, rows: 2 },
      { key: 'introduction', label: 'Program introduction', type: 'textarea', full: true, rows: 4 },
      { key: 'objectives', label: 'Learning objectives', type: 'lines', full: true, hint: 'One objective per line.' },
      { key: 'activities', label: 'Learning activities', type: 'textarea', full: true, rows: 3 },
      { key: 'image', label: 'Image', type: 'image' }, tone, order,
      { key: 'featured', label: 'Feature on the home page', type: 'checkbox' }, ...flags,
    ],
  },
  {
    resource: 'instructors', title: 'Instructors', singular: 'instructor', primary: 'name', secondary: ['position'],
    defaults: { tone: 'lav', photo: '/art/art-portrait.svg', published: true, isPlaceholder: false, sortOrder: 0 },
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true }, slug,
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'qualification', label: 'Qualification', type: 'text' },
      { key: 'shortBio', label: 'Short biography', type: 'textarea', full: true, rows: 2 },
      { key: 'biography', label: 'Full biography', type: 'textarea', full: true, rows: 5 },
      { key: 'experience', label: 'Teaching experience', type: 'text' },
      { key: 'expertise', label: 'Areas of expertise', type: 'text' },
      { key: 'photo', label: 'Photo', type: 'image', hint: 'Path or URL of the portrait.' }, tone, order, ...flags,
    ],
  },
  {
    resource: 'resources', title: 'Learning resources', singular: 'resource', primary: 'title', secondary: ['category', 'publishedOn'],
    defaults: { tone: 'sky', cover: ART[0], published: true, isPlaceholder: false, featured: false, category: 'Study Resources' },
    fields: [
      { key: 'title', label: 'Article title', type: 'text', required: true, full: true }, slug,
      { key: 'category', label: 'Category', type: 'select', required: true, options: ['Study Resources', 'Learning Guides', 'Parent Information', 'Educational Activities', 'Student Development'] },
      { key: 'summary', label: 'Short description', type: 'textarea', full: true, rows: 2 },
      { key: 'body', label: 'Article body', type: 'textarea', full: true, rows: 12, hint: 'Separate paragraphs with a blank line. Start a line with “## ” for a heading.' },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'publishedOn', label: 'Publication date', type: 'date', nullable: true },
      { key: 'readMinutes', label: 'Read time (minutes)', type: 'number', nullable: true },
      { key: 'cover', label: 'Cover image', type: 'image' }, tone,
      { key: 'featured', label: 'Featured article (only one at a time)', type: 'checkbox' }, ...flags,
    ],
  },
  {
    resource: 'events', title: 'Events', singular: 'event', primary: 'title', secondary: ['category', 'startAt'],
    defaults: { tone: 'sky', banner: '/art/art-calendar.svg', published: true, isPlaceholder: false },
    fields: [
      { key: 'title', label: 'Event title', type: 'text', required: true, full: true }, slug,
      { key: 'category', label: 'Category', type: 'text', hint: 'e.g. Workshop, Activity, Announcement' },
      { key: 'startAt', label: 'Date & start time', type: 'datetime', required: true, hint: 'Decides whether it shows as upcoming or past.' },
      { key: 'timeLabel', label: 'Time label (optional)', type: 'text', hint: 'e.g. 4:00 – 5:30 PM' },
      { key: 'location', label: 'Location', type: 'text', hint: 'Leave empty to show the center address.' },
      { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 5 },
      { key: 'registrationUrl', label: 'Registration link (optional)', type: 'text', full: true, hint: 'Only add if online registration really exists.' },
      { key: 'banner', label: 'Banner image', type: 'image' }, tone, ...flags,
    ],
  },
  {
    resource: 'faqs', title: 'Admissions FAQs', singular: 'FAQ', primary: 'question',
    defaults: { published: true, isPlaceholder: false, sortOrder: 0 },
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true, full: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true, full: true, rows: 4 }, order, ...flags,
    ],
  },
  {
    resource: 'requirements', title: 'Registration requirements', singular: 'requirement', primary: 'title', secondary: ['detail'],
    defaults: { published: true, isPlaceholder: false, sortOrder: 0 },
    fields: [
      { key: 'title', label: 'Requirement', type: 'text', required: true, full: true },
      { key: 'detail', label: 'Details', type: 'textarea', full: true, rows: 3 }, order, ...flags,
    ],
  },
  {
    resource: 'testimonials', title: 'Testimonials', singular: 'testimonial', primary: 'attribution', secondary: ['quote'],
    defaults: { published: false, consentConfirmed: false, sortOrder: 0 },
    fields: [
      { key: 'quote', label: 'Quote (exact words)', type: 'textarea', required: true, full: true, rows: 4 },
      { key: 'attribution', label: 'Attribution', type: 'text', required: true, hint: 'e.g. “Parent of a 4th grader”' }, order,
      { key: 'consentConfirmed', label: 'The family gave permission to publish this', type: 'checkbox' },
      { key: 'published', label: 'Published on the home page', type: 'checkbox' },
    ],
  },
];

/** Entity → form values. */
export function toForm(fields: FieldDef[], item: Record<string, unknown>): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = item[f.key];
    if (f.type === 'checkbox') out[f.key] = !!v;
    else if (f.type === 'lines') out[f.key] = Array.isArray(v) ? v.join('\n') : '';
    else if (f.type === 'datetime' && typeof v === 'string' && v) {
      const d = new Date(v);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      out[f.key] = local.toISOString().slice(0, 16);
    } else out[f.key] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

/** Form values → API payload. */
export function toPayload(fields: FieldDef[], form: Record<string, string | boolean>, isEdit: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form[f.key];
    if (f.type === 'checkbox') { out[f.key] = !!v; continue; }
    const s = typeof v === 'string' ? v.trim() : '';
    if (f.key === 'slug') { if (s) out.slug = s; continue; }
    switch (f.type) {
      case 'number':
        if (s === '') { if (f.nullable) out[f.key] = null; else if (!isEdit) continue; }
        else out[f.key] = Number(s);
        break;
      case 'lines':
        out[f.key] = s.split('\n').map((x) => x.trim()).filter(Boolean);
        break;
      case 'date':
        out[f.key] = s || null;
        break;
      case 'datetime':
        if (s) out[f.key] = new Date(s).toISOString();
        break;
      default:
        out[f.key] = s;
    }
  }
  return out;
}
