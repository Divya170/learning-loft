/** Brand surface tones used by image frames in the UI. */
export const TONES = ['sky', 'lav', 'cream', 'yel', 'white'] as const;
export type Tone = (typeof TONES)[number];

export const CONTACT_METHODS = ['Email', 'Phone call', 'Text message'] as const;
export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;
export const MESSAGE_STATUSES = ['new', 'replied', 'closed'] as const;
export const CONTACT_TOPICS = [
  'Programs',
  'Enrollment',
  'Instructors',
  'Events',
  'Learning resources',
  'Something else',
] as const;

/** Duplicate-submission window for public forms. */
export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
/** Max public form submissions per visitor per window. */
export const SUBMISSION_LIMIT = 5;
export const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;
