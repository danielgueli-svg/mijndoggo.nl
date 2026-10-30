-- MijnDoggo preview subscribers (own D1 "mijndoggo-preview-signups"; NOT the shared puppyalert-listings DB).
CREATE TABLE IF NOT EXISTS signups (
  email TEXT PRIMARY KEY,
  breeds TEXT NOT NULL,            -- JSON array of EN breed keys
  country TEXT NOT NULL DEFAULT 'NL',
  near TEXT,                       -- JSON {province|null, radius, unit:"km", crossBorder, reach:[BE|DE]}
  plan TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  confirmed_at TEXT,
  unsub_token TEXT NOT NULL UNIQUE,
  unsubscribed_at TEXT,
  payment_id TEXT,
  payment_status TEXT,
  paid_at TEXT,
  mail_status TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
