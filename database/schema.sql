-- Wrongful Conviction Detection System Database Schema

-- Organizations table
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'investigator', 'viewer')),
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases table
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL UNIQUE,
    defendant_name VARCHAR(255) NOT NULL,
    conviction_date DATE,
    sentence TEXT,
    crime_charged TEXT NOT NULL,
    county VARCHAR(100) NOT NULL,
    court_name VARCHAR(255),
    case_status VARCHAR(50) NOT NULL CHECK (case_status IN ('flagged', 'claimed', 'under_investigation', 'closed', 'exonerated')),
    priority_score DECIMAL(5,2),
    claimed_by_org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    claimed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demographic information
CREATE TABLE case_demographics (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    defendant_age_at_conviction INTEGER,
    defendant_race VARCHAR(50),
    defendant_gender VARCHAR(50),
    socioeconomic_status VARCHAR(50),
    prior_record BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicator categories
CREATE TABLE indicator_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicator definitions
CREATE TABLE indicators (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES indicator_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    detection_pattern TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case indicators (detected indicators for each case)
CREATE TABLE case_indicators (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES indicators(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5,4),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, indicator_id)
);

-- Evidence citations
CREATE TABLE evidence_citations (
    id SERIAL PRIMARY KEY,
    case_indicator_id INTEGER REFERENCES case_indicators(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_id VARCHAR(255),
    page_number INTEGER,
    line_number INTEGER,
    timestamp_in_doc VARCHAR(50),
    quoted_text TEXT,
    context_before TEXT,
    context_after TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    content_text TEXT,
    page_count INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP
);

-- Case notes
CREATE TABLE case_notes (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) CHECK (note_type IN ('general', 'investigation', 'legal', 'contact')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(case_status);
CREATE INDEX idx_cases_priority ON cases(priority_score DESC);
CREATE INDEX idx_cases_claimed_org ON cases(claimed_by_org_id);
CREATE INDEX idx_case_indicators_case ON case_indicators(case_id);
CREATE INDEX idx_case_indicators_indicator ON case_indicators(indicator_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_evidence_citations_case_indicator ON evidence_citations(case_indicator_id);
CREATE INDEX idx_case_notes_case ON case_notes(case_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- Create full-text search indexes
CREATE INDEX idx_documents_content_fts ON documents USING gin(to_tsvector('english', content_text));
CREATE INDEX idx_cases_defendant_fts ON cases USING gin(to_tsvector('english', defendant_name));