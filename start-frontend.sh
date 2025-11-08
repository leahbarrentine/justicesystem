#!/bin/bash
# Start Frontend Service

echo "Starting Frontend Service..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file"
fi

echo "Starting frontend server on port 3000..."
npm run dev