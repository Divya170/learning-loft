# The Learning Loft — Website

Full-stack implementation of The Learning Loft's 8-page website (Oxnard, CA), built from the approved design canvas.

| Layer    | Tech                         | Folder      |
|----------|------------------------------|-------------|
| Frontend | Next.js 15 (App Router, React 19, TypeScript) | `frontend/` |
| Backend  | NestJS 10 (REST API, class-validator)          | `backend/`  |
| Database | SQLite 3 via better-sqlite3                    | `database/app.sqlite` |

```
learning-loft/
├── backend/            NestJS API — all business rules, validation and persistence
│   ├── src/
│   │   ├── common/        admin guard, validation, rate limiter, generic CRUD
│   │   ├── database/      SQLite service + typed repository
│   │   ├── programs/      list · filters/facets · detail · admin CRUD
│   │   ├── instructors/   directory · profile · admin CRUD
│   │   ├── resources/     search · categories · featured · article · admin CRUD
│   │   ├── events/        upcoming/past · categories · detail · admin CRUD
│   │   ├── site-content/  FAQs · registration requirements · testimonials
│   │   ├── settings/      contact details & site settings
│   │   ├── inquiries/     enrollment inquiries (public submit + admin)
│   │   ├── contact/       contact messages (public submit + admin)
│   │   └── admin/         token check, dashboard stats
│   └── scripts/reset-db.js
├── frontend/           Next.js site + /admin dashboard
│   ├── app/(site)/     Home, Programs, About, Instructors, Admissions,
│   │                   Resources (+ /resources/[slug]), Events (+ /events/[slug]), Contact
│   ├── app/admin/      content management dashboard
│   ├── components/     header, footer, sheet, FAQ, success card, admin UI …
│   ├── lib/            API client, types, formatting, client-side validation
│   └── public/art/     brand illustrations (placeholders for real photography)
├── database/
│   ├── schema.sql      tables & indexes (applied on every start, idempotent)
│   ├── seed.sql        starter content — clearly marked placeholders only
│   └── app.sqlite      ready-to-use database (schema + seed applied)
├── scripts/setup-env.js
└── package.json        convenience scripts for both apps
```

## Quick start

Requires **Node.js 20.12+** (22 LTS recommended).

```bash
npm install            # root helper (concurrently)
npm run setup          # installs backend + frontend, creates .env files, prints your admin token
npm run dev            # API on http://localhost:4000/api · site on http://localhost:3000
```

* Website: <http://localhost:3000>
* Admin dashboard: <http://localhost:3000/admin> — sign in with `ADMIN_TOKEN` from `backend/.env`
* Health check: <http://localhost:4000/api/health>

Production: `npm run build && npm start`. Reset the database to the starter content with `npm run db:reset` (deletes all data).

### Configuration

`backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `CORS_ORIGIN` | Allowed browser origins (comma-separated) |
| `DATABASE_PATH` | SQLite file; `schema.sql`/`seed.sql` are read from the same folder |
| `ADMIN_TOKEN` | Secret for the admin dashboard (admin is disabled if unset) |
| `IP_HASH_SALT` | Salt for hashing visitor IPs used in rate limiting |

`frontend/.env.local`: `API_URL` — where the Next.js server reaches the API. The browser always calls same-origin `/api/*`, which Next rewrites to the API (no CORS in the browser).

## How it works

### Pages & dynamic behaviour

| Page | Data (API) | Interactions |
|---|---|---|
| Home | site settings, featured programs, instructors, testimonials | cross-fading hero (pause / dots, reduced-motion aware); testimonials section only renders when consented testimonials exist |
| Programs | `/programs`, `/programs/facets`, `/programs/:slug` | server-side filtering by category / age group / level (only filters with real data are shown), active-filter chips, clear, empty & error states, URL-synced filters, detail sheet (`?view=slug`, deep-linkable), related programs, **Enquire** → Admissions with the program pre-selected |
| About | — (brand copy, placeholders) | drifting environment strip with pause control |
| Our Instructors | `/instructors` | profile directory, profile sheet (`?view=slug`) |
| Admissions | `/requirements`, `/faqs`, `/programs/options`, `POST /inquiries` | enrollment timeline, requirements, accessible FAQ accordion, inquiry form (below) |
| Learning Resources | `/resources`, `/resources/categories`, `/resources/featured`, `/resources/:slug` | debounced title search, category tiles, counts, pagination ("Load more"), empty/error states, article pages with related resources |
| Events | `/events?when=upcoming|past`, `/events/categories`, `/events/:slug` | upcoming/past tabs, category filter (only when there are categories), empty state, detail pages; registration button only if a registration link exists |
| Contact | `/site`, `POST /contact` | tap-to-call / mailto, embedded Google map, directions link, contact form (topic pre-fill via `?topic=`) |
| Admin | `/admin/*` | overview stats, inquiries & messages (search, status filter, status updates, notes, delete), CRUD for programs, instructors, resources, events, FAQs, requirements, testimonials, site details |

### Forms (enrollment inquiry & contact)

* Inline validation on blur + error summary with links to fields; the **API is the source of truth** and its field errors are shown in the same places.
* Loading state, double-submit guard on the client, **duplicate detection** on the server (same email + student within 10 minutes → 409 with the earlier reference).
* Rate limit: 5 submissions per visitor per 10 minutes (IP hashed, never stored raw).
* Honeypot spam trap (bots get a fake success, nothing is stored).
* Phone is required only when the family picks "Phone call" or "Text message".
* Only a student **first name** and **age/grade** are collected — no date of birth or sensitive data.
* On success a **success card** shows a reference number (e.g. `LL-261118-7KQ4`), what happens next, and next-action buttons (Explore Programs / Browse Resources or Start an Enrollment Inquiry) plus "start another".
* An inquiry is clearly presented as *not* a confirmed admission.

### Business rules enforced by the API

* Only published content is public; placeholders are flagged (`isPlaceholder`) and shown with a yellow "to be supplied" tag.
* Slugs are generated from names/titles and kept unique.
* One featured article at a time.
* Events are upcoming/past by their start time.
* Testimonials can't be published (or stay published) without confirmed family consent.
* Inquiries must reference a currently published program (or "Not sure yet"); deleting a program keeps past inquiries (program link set to null, name kept).
* Inquiry statuses: `new → contacted → closed`; message statuses: `new → replied → closed`.

### API reference (prefix `/api`)

Public: `GET /site` · `GET /programs` (`category, ageGroup, level, q, featured`) · `GET /programs/facets` · `GET /programs/options` · `GET /programs/:slug` · `GET /instructors` · `GET /instructors/:slug` · `GET /resources` (`q, category, page, pageSize`) · `GET /resources/featured` · `GET /resources/categories` · `GET /resources/:slug` · `GET /events` (`when, category`) · `GET /events/categories` · `GET /events/:slug` · `GET /faqs` · `GET /requirements` · `GET /testimonials` · `POST /inquiries` · `POST /contact` · `GET /health`

Admin (`Authorization: Bearer <ADMIN_TOKEN>`): `POST /auth/verify` · `GET /admin/stats` · `GET|PATCH|DELETE /admin/inquiries[/:id]` · `GET|PATCH|DELETE /admin/messages[/:id]` · `GET|POST /admin/{programs|instructors|resources|events|faqs|requirements|testimonials}` · `GET|PATCH|DELETE /admin/{…}/:id` · `PUT /admin/site`

Validation errors return `400 { message, errors: { field: message } }`.

## Content: what's real and what's a placeholder

Only the supplied business details are real: **1572 Lake Boulevard, Oxnard, CA 93030 · +1 (421) 574-7385 · thelearningloft@hotmail.com**.
Programs, instructors, articles, most FAQ answers and registration requirements are seeded as **[bracketed] placeholders** — nothing is invented. No events or testimonials are seeded, so the site shows its empty states. Replace placeholders in the admin dashboard and untick "Placeholder content". Illustrations stand in for photography; swap image paths for real photos of the center.

## Integration points

* **Email notifications**: `InquiriesService.submit` and `ContactService.submit` log each new submission — hook an email provider in there to notify staff / confirm to families.
* **Stronger spam protection**: add a privacy-friendly challenge (e.g. Cloudflare Turnstile) alongside the honeypot if spam appears.
* **Privacy policy**: add its URL under Admin → Site details; it then appears next to the consent checkboxes.
* The rate limiter is in-memory (single process). For multiple API instances, move it to a shared store.
