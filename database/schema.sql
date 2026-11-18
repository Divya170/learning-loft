-- The Learning Loft — SQLite schema
-- Safe to run repeatedly (IF NOT EXISTS). Applied by the backend on start-up.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS programs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT '',
  age_group      TEXT NOT NULL DEFAULT '',
  level          TEXT NOT NULL DEFAULT '',
  summary        TEXT NOT NULL DEFAULT '',
  introduction   TEXT NOT NULL DEFAULT '',
  objectives     TEXT NOT NULL DEFAULT '[]',   -- JSON array of strings
  activities     TEXT NOT NULL DEFAULT '',
  image          TEXT NOT NULL DEFAULT '/art/art-reading.svg',
  tone           TEXT NOT NULL DEFAULT 'sky',
  featured       INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS instructors (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  position       TEXT NOT NULL DEFAULT '',
  qualification  TEXT NOT NULL DEFAULT '',
  short_bio      TEXT NOT NULL DEFAULT '',
  biography      TEXT NOT NULL DEFAULT '',
  experience     TEXT NOT NULL DEFAULT '',
  expertise      TEXT NOT NULL DEFAULT '',
  photo          TEXT NOT NULL DEFAULT '/art/art-portrait.svg',
  tone           TEXT NOT NULL DEFAULT 'lav',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS resources (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT '',
  summary        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL DEFAULT '',     -- paragraphs separated by blank lines; "## " starts a heading
  author         TEXT NOT NULL DEFAULT '',
  published_on   TEXT,                         -- ISO date (YYYY-MM-DD)
  read_minutes   INTEGER,
  cover          TEXT NOT NULL DEFAULT '/art/art-reading.svg',
  tone           TEXT NOT NULL DEFAULT 'sky',
  featured       INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT '',
  description      TEXT NOT NULL DEFAULT '',
  start_at         TEXT NOT NULL,              -- ISO date-time; decides upcoming vs past
  time_label       TEXT NOT NULL DEFAULT '',
  location         TEXT NOT NULL DEFAULT '',
  registration_url TEXT NOT NULL DEFAULT '',
  banner           TEXT NOT NULL DEFAULT '/art/art-calendar.svg',
  tone             TEXT NOT NULL DEFAULT 'sky',
  is_placeholder   INTEGER NOT NULL DEFAULT 0,
  published        INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  quote             TEXT NOT NULL,
  attribution       TEXT NOT NULL DEFAULT '',
  consent_confirmed INTEGER NOT NULL DEFAULT 0,  -- must be 1 before publishing
  sort_order        INTEGER NOT NULL DEFAULT 0,
  published         INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS requirements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  detail         TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_placeholder INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  reference          TEXT NOT NULL UNIQUE,
  parent_name        TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT NOT NULL DEFAULT '',
  student_first_name TEXT NOT NULL,
  student_age        TEXT NOT NULL,
  program_id         INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  program_name       TEXT NOT NULL DEFAULT '',
  contact_method     TEXT NOT NULL DEFAULT 'Email',
  message            TEXT NOT NULL DEFAULT '',
  consent            INTEGER NOT NULL DEFAULT 0,
  status             TEXT NOT NULL DEFAULT 'new',  -- new | contacted | closed
  notes              TEXT NOT NULL DEFAULT '',
  ip_hash            TEXT NOT NULL DEFAULT '',
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  reference    TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL DEFAULT '',
  inquiry_type TEXT NOT NULL,
  message      TEXT NOT NULL,
  consent      INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'new',  -- new | replied | closed
  notes        TEXT NOT NULL DEFAULT '',
  ip_hash      TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_programs_pub     ON programs(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_instructors_pub  ON instructors(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_resources_pub    ON resources(published, category);
CREATE INDEX IF NOT EXISTS idx_events_start     ON events(published, start_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_dupe   ON inquiries(email, student_first_name, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_status  ON contact_messages(status, created_at);
