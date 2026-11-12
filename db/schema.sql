-- Run once in the Neon SQL Editor before starting the application.
-- All statements are idempotent so they can safely be re-run.

CREATE TABLE IF NOT EXISTS users (
  firebase_uid text PRIMARY KEY,
  email text,
  display_name text,
  welcome_email_claimed_at timestamptz,
  welcome_email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_claimed_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_reports (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  report_json jsonb NOT NULL,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analysis_reports_by_user
  ON analysis_reports (user_id, analyzed_at DESC);

CREATE TABLE IF NOT EXISTS verification_records (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL UNIQUE REFERENCES analysis_reports(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('completed')),
  risk_score integer NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_records_by_user
  ON verification_records (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY,
  user_id text REFERENCES users(firebase_uid) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_by_user
  ON audit_logs (user_id, created_at DESC);
