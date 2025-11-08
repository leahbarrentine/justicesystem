# System Architecture

## Overview

The Wrongful Conviction Detection System is designed as a three-tier architecture with specialized components for data processing, analysis, and user interaction.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + TypeScript + TanStack Query                         │
│  - Dashboard UI                                              │
│  - Case Detail Views                                         │
│  - Organization Management                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (HTTPS)
┌─────────────────────▼───────────────────────────────────────┐
│                      Backend API Layer                       │
│  Node.js + Express + TypeScript                              │
│  - Authentication & Authorization                            │
│  - Case Management                                           │
│  - Priority Ranking                                          │
│  - API Endpoints                                             │
└─────────────────────┬──────────────┬────────────────────────┘
                      │              │
                      │              │ HTTP API
         PostgreSQL   │              │
              ┌───────▼──────┐  ┌────▼─────────────────────┐
              │   Database   │  │   NLP Service (Python)    │
              │              │  │  - Pattern Detection      │
              │  - Cases     │  │  - 30 Indicator Detectors │
              │  - Indicators│  │  - Document Analysis      │
              │  - Users     │  │  - Evidence Citation      │
              │  - Orgs      │  └──────────────────────────┘
              └──────────────┘
```

## Data Flow

### Case Analysis Pipeline

1. **Data Ingestion**
   - Court database connector retrieves case documents
   - Documents stored in database
   - Metadata extracted and indexed

2. **NLP Analysis**
   - Backend sends documents to NLP service
   - Multiple detectors run in parallel:
     * Confession detector
     * Eyewitness detector
     * Forensic detector
     * Misconduct detector
     * Additional specialized detectors
   - Evidence citations extracted with context

3. **Indicator Detection**
   - Pattern matching against 30 indicators
   - Confidence scores calculated
   - Citations linked to specific document locations

4. **Priority Ranking**
   - Weighted scoring algorithm runs
   - Factors considered:
     * Number of indicators
     * Severity levels
     * Confidence scores
     * Category weights
     * Indicator combinations
   - Priority score (0-100) assigned

5. **Case Flagging**
   - Cases above threshold flagged for review
   - Detailed reports generated
   - Added to organization dashboard

### User Workflow

1. **Authentication**
   - User logs in via organization credentials
   - JWT token issued
   - Role-based permissions applied

2. **Dashboard View**
   - Filtered list of flagged cases
   - Sorted by priority score
   - Status indicators
   - Quick metrics

3. **Case Review**
   - Detailed case information
   - All detected indicators shown
   - Evidence citations with context
   - Document references

4. **Case Claiming**
   - Organization claims case
   - Status updated to prevent duplicates
   - Assigned investigator tracked

## Database Schema

### Core Tables

**cases**
- Case metadata
- Conviction details
- Status tracking
- Priority scores

**indicators**
- 30 predefined indicators
- Category associations
- Severity levels
- Detection patterns

**case_indicators**
- Links cases to detected indicators
- Confidence scores
- Detection timestamps

**evidence_citations**
- Document references
- Page/line numbers
- Quoted text
- Surrounding context

**organizations**
- Innocence organizations
- Contact information
- Active status

**users**
- User accounts
- Role assignments
- Organization associations

## Security Architecture

### Authentication Flow
```
User Login → JWT Generation → Token Storage → Request Authentication
```

### Authorization Levels
- **Admin**: Full system access
- **Investigator**: Case claiming and management
- **Viewer**: Read-only access

### Data Protection
- Passwords: bcrypt hashing
- API: JWT tokens
- Database: Connection encryption
- Transport: HTTPS only

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer ready
- Database connection pooling

### Performance Optimization
- Database indexing on key fields
- Query optimization
- API response caching
- Lazy loading in frontend

### Processing Pipeline
- Async document analysis
- Queue-based processing
- Batch operations support

## Monitoring Points

1. **Application Metrics**
   - Request latency
   - Error rates
   - Active users
   - Case processing time

2. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Storage utilization

3. **NLP Service Metrics**
   - Analysis throughput
   - Detection accuracy
   - Processing time per document

## Error Handling

- Centralized error middleware
- Structured error responses
- Comprehensive logging
- User-friendly error messages
- Automatic retry logic