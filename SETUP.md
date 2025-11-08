# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 14+
- Git

## Installation

### 1. Clone and Install Dependencies

```bash
cd wrongful-conviction-detection

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Python NLP service dependencies
cd ../nlp-service
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb wrongful_conviction_db

# Run migrations
cd backend
npm run migrate
```

### 3. Environment Configuration

Create `.env` files in backend and frontend directories:

**backend/.env**:
```
DATABASE_URL=postgresql://localhost:5432/wrongful_conviction_db
JWT_SECRET=your-secret-key-here
NLP_SERVICE_URL=http://localhost:5001
PORT=3001
NODE_ENV=development
```

**frontend/.env**:
```
VITE_API_URL=http://localhost:3001
```

**nlp-service/.env**:
```
PORT=5001
MODEL_PATH=./models
```

### 4. Start Services

```bash
# Terminal 1: Start PostgreSQL
# (should already be running)

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start NLP service
cd nlp-service
python app.py

# Terminal 4: Start frontend
cd frontend
npm run dev
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# NLP service tests
cd nlp-service
pytest
```

### Generate Mock Data

```bash
cd backend
npm run seed
```

This will generate realistic mock case data for testing.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.