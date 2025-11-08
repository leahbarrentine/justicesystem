# Quick Start Guide - No Database Installation Required!

This system now uses SQLite - no PostgreSQL installation needed!

## Prerequisites

- Node.js 18+ ([download here](https://nodejs.org/))
- Python 3.9+ ([download here](https://www.python.org/downloads/))

## Three Simple Steps

### Step 1: Open Three Terminal Tabs

Open your Terminal application and create 3 tabs (⌘+T twice to make 3 total tabs).

### Step 2: Run Backend (Tab 1)

In the first tab:
```bash
cd /Users/leahbarrentine/wrongful-conviction-detection
./start-backend.sh
```

Wait until you see "Server running on port 3001"

### Step 3: Run Frontend (Tab 2)

Switch to the second tab (⌘+Shift+→), then:
```bash
cd /Users/leahbarrentine/wrongful-conviction-detection
./start-frontend.sh
```

Wait until you see "Local: http://localhost:3000"

### Step 4: Run NLP Service (Tab 3)

Switch to the third tab (⌘+Shift+→), then:
```bash
cd /Users/leahbarrentine/wrongful-conviction-detection
./start-nlp.sh
```

Wait until you see "NLP service running on port 5001"

### Step 5: Open Your Browser

Go to: **http://localhost:3000**

Login with default credentials:
- Email: `admin@justice.org`
- Password: `justice123`

## What You'll See

- Dashboard with 50 mock cases ranked by priority
- Each case shows wrongful conviction indicators
- Detailed case views with evidence citations
- Ability to claim cases for investigation

## Troubleshooting

**If you see "command not found: node"**
- Install Node.js from nodejs.org

**If you see "command not found: python"**
- Install Python from python.org

**If ports are already in use**
- Change ports in .env files (backend/.env and frontend/.env)

## Stopping the Services

Press Ctrl+C in each terminal tab to stop that service.