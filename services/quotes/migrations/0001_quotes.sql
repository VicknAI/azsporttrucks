CREATE TABLE quote_requests (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  contact_json TEXT NOT NULL,
  configuration_json TEXT NOT NULL,
  assets_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('uploading','received')),
  upload_owner TEXT,
  upload_until INTEGER NOT NULL DEFAULT 0,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending','sending','sent','failed')),
  email_attempts INTEGER NOT NULL DEFAULT 0,
  email_next_at INTEGER NOT NULL DEFAULT 0,
  email_lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX quote_email_due ON quote_requests(email_status,email_next_at,email_lease_until) WHERE status='received';
CREATE TABLE quote_rate_limits (
  bucket TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
