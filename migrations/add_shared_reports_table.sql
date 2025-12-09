-- Migration: Add shared_reports table for shareable vehicle reports
-- This allows users to generate shareable links for vehicle reliability reports

CREATE TABLE IF NOT EXISTS shared_reports (
  id SERIAL PRIMARY KEY,
  share_id VARCHAR(32) UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  mileage INTEGER,
  reliability_data JSONB NOT NULL,
  specifications_data JSONB,
  timeline_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  view_count INTEGER DEFAULT 0
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_reports_share_id ON shared_reports(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_expires_at ON shared_reports(expires_at);

-- Add comment
COMMENT ON TABLE shared_reports IS 'Stores shareable vehicle reliability reports with expiration';
COMMENT ON COLUMN shared_reports.share_id IS 'Unique identifier for the shareable URL';
COMMENT ON COLUMN shared_reports.expires_at IS 'Reports expire after 30 days by default';
