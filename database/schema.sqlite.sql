-- SQLite Schema for Wrongful Conviction Detection System
-- No PostgreSQL extensions needed

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  website TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'investigator', 'viewer')),
  active INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Indicator categories
CREATE TABLE IF NOT EXISTS indicator_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Individual indicators
CREATE TABLE IF NOT EXISTS indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  weight REAL DEFAULT 1.0,
  detection_pattern TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES indicator_categories(id)
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT NOT NULL UNIQUE,
  defendant_name TEXT NOT NULL,
  crime_charged TEXT NOT NULL,
  conviction_date TEXT,
  sentence TEXT,
  county TEXT NOT NULL,
  court_name TEXT,
  case_status TEXT DEFAULT 'flagged' CHECK(case_status IN ('flagged', 'claimed', 'under_investigation', 'closed', 'exonerated')),
  priority_score REAL DEFAULT 0,
  claimed_by_org_id INTEGER,
  claimed_by_user_id INTEGER,
  claimed_at TEXT,
  demographics TEXT, -- JSON stored as text
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claimed_by_org_id) REFERENCES organizations(id),
  FOREIGN KEY (claimed_by_user_id) REFERENCES users(id)
);

-- Case indicators (many-to-many)
CREATE TABLE IF NOT EXISTS case_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  indicator_id INTEGER NOT NULL,
  confidence_score REAL DEFAULT 0.5,
  detected_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id)
);

-- Evidence citations
CREATE TABLE IF NOT EXISTS case_indicator_citations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_indicator_id INTEGER NOT NULL,
  document_type TEXT,
  page_number INTEGER,
  line_number INTEGER,
  timestamp_value TEXT,
  quoted_text TEXT,
  context_before TEXT,
  context_after TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_indicator_id) REFERENCES case_indicators(id) ON DELETE CASCADE
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT, -- JSON stored as text
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(case_status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_cases_county ON cases(county);
CREATE INDEX IF NOT EXISTS idx_case_indicators_case ON case_indicators(case_id);
CREATE INDEX IF NOT EXISTS idx_case_indicators_indicator ON case_indicators(indicator_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);