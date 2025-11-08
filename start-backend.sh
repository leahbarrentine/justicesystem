#!/bin/bash
# Start Backend Service

echo "Starting Backend Service..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file"
fi

# Initialize SQLite database if it doesn't exist
if [ ! -f "../database/wrongful_conviction.db" ]; then
    echo "Initializing SQLite database..."
    npm run migrate
fi

echo "Generating mock data..."
npm run seed

echo "Starting backend server on port 3001..."
npm run dev