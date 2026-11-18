/** Shapes returned by the NestJS API. */
export type Tone = 'sky' | 'lav' | 'cream' | 'yel' | 'white';

interface Base {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  street: string;
  city: string;
  country: string;
  mapQuery: string;
  hours: string;
  privacyUrl: string;
  mapsUrl: string;
  directionsUrl: string;
}

export interface Program extends Base {
  slug: string;
  name: string;
  category: string;
  ageGroup: string;
  level: string;
  summary: string;
  introduction: string;
  objectives: string[];
  activities: string;
  image: string;
  tone: Tone;
  featured: boolean;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Facet {
  value: string;
  count: number;
}

export interface ProgramFacets {
  total: number;
  category: Facet[];
  ageGroup: Facet[];
  level: Facet[];
}

export interface ProgramOption {
  id: number;
  name: string;
  slug: string;
}

export interface Instructor extends Base {
  slug: string;
  name: string;
  position: string;
  qualification: string;
  shortBio: string;
  biography: string;
  experience: string;
  expertise: string;
  photo: string;
  tone: Tone;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Resource extends Base {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body?: string;
  author: string;
  publishedOn: string | null;
  readMinutes: number | null;
  cover: string;
  tone: Tone;
  featured: boolean;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface LoftEvent extends Base {
  slug: string;
  title: string;
  category: string;
  description: string;
  startAt: string;
  timeLabel: string;
  location: string;
  registrationUrl: string;
  banner: string;
  tone: Tone;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Faq extends Base {
  question: string;
  answer: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Requirement extends Base {
  title: string;
  detail: string;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Testimonial {
  id: number;
  quote: string;
  attribution: string;
}

export interface InquiryReceipt {
  reference: string;
  submittedAt: string;
  programName: string;
  contactMethod: string;
}

export interface MessageReceipt {
  reference: string;
  submittedAt: string;
  inquiryType: string;
}

export interface Inquiry extends Base {
  reference: string;
  parentName: string;
  email: string;
  phone: string;
  studentFirstName: string;
  studentAge: string;
  programId: number | null;
  programName: string;
  contactMethod: string;
  message: string;
  consent: boolean;
  status: string;
  notes: string;
}

export interface ContactMessage extends Base {
  reference: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  consent: boolean;
  status: string;
  notes: string;
}

export interface AdminStats {
  inquiries: Record<string, number>;
  messages: Record<string, number>;
  programs: number;
  instructors: number;
  resources: number;
  upcomingEvents: number;
  placeholders: number;
}
