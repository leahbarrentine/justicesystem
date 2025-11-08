# Wrongful Conviction Detection System

A comprehensive web platform designed to systematically identify potentially wrongfully convicted individuals in California by leveraging automated analysis of court records.

## Quick Start

```bash
# 1. Clone and navigate to project
cd wrongful-conviction-detection

# 2. Set up database
createdb wrongful_conviction_db
psql wrongful_conviction_db < database/schema.sql
psql wrongful_conviction_db < database/seed-data.sql

# 3. Install and start backend
cd backend
cp .env.example .env
npm install
npm run seed  # Generate mock case data
npm run dev   # Starts on port 3001

# 4. Install and start frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev   # Starts on port 3000

# 5. Install and start NLP service (new terminal)
cd nlp-service
pip install -r requirements.txt
python app.py  # Starts on port 5001
```

Access the application at `http://localhost:3000`

## Overview

This system interfaces with California court databases to access hearing transcripts and evidence from recently closed criminal cases. It uses natural language processing and pattern recognition to identify 30+ specific indicators of potential wrongful conviction, ranks cases by strength of innocence evidence, and provides tools for innocence organizations to review and claim cases for investigation.

## Core Features

### 1. Automated Data Retrieval
- Connects to California court databases (mock implementation included)
- Automatically pulls hearing transcripts and accessible evidence
- Regular scheduled updates for recently closed cases

### 2. Pattern Detection Engine
- Scans case documents using NLP and pattern recognition
- Detects 30+ specific indicators of wrongful conviction including:
  - Coerced confessions and recantations
  - Unreliable eyewitness testimony
  - Prosecutorial misconduct
  - Ineffective defense counsel
  - DNA evidence issues
  - And 25+ additional indicators

### 3. Case Flagging System
- Generates detailed reports showing:
  - Identified indicators with severity ratings
  - Exact locations in transcripts (page numbers, timestamps, quotes)
  - Contextual evidence surrounding each indicator
  - Demographic risk factors
  - Priority score

### 4. Priority Ranking Algorithm
- Weighted scoring system considering:
  - Number and type of indicators
  - Severity/reliability of each indicator
  - Quality of innocence evidence
  - Presence of exculpatory evidence

### 5. Case Management Dashboard
- View ranked list of flagged cases
- Access detailed flag reports with citations
- Claim cases for investigation
- Track case status across organizations
- Prevent duplicate investigation efforts

## Technology Stack

- **Frontend**: React 18 with TypeScript, TanStack Query, React Hook Form
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with proper indexing
- **NLP/ML**: Python with spaCy, transformers, scikit-learn
- **Search**: Full-text search capabilities
- **Authentication**: Secure JWT-based auth with role-based access

## Project Structure

```
wrongful-conviction-detection/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── utils/       # Helper functions
│   └── tests/           # Backend tests
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   └── utils/       # Utilities
│   └── public/          # Static assets
├── nlp-service/         # Python NLP analysis service
│   ├── detectors/       # Indicator detection modules
│   ├── models/          # ML models
│   └── utils/           # NLP utilities
├── database/            # Database schemas and migrations
└── docs/                # Additional documentation
```

## Ethical Considerations

This system is designed with several critical ethical safeguards:

1. **Transparency**: All algorithmic decisions are explainable and auditable
2. **Bias Mitigation**: Careful design to avoid reinforcing systemic biases
3. **Human-in-the-Loop**: System assists, not replaces, human judgment
4. **Privacy Protection**: Sensitive legal data handled with appropriate security
5. **Audit Logging**: Complete trail of all system actions and decisions

## Getting Started

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## License

This project is designed for use by innocence organizations and legal advocacy groups working to identify and correct wrongful convictions.

## Disclaimer

This system is a tool to assist legal professionals and should not be used as the sole basis for legal decisions. All flagged cases require thorough human review and investigation.