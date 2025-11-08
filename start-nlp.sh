#!/bin/bash
# Start NLP Service

echo "Starting NLP Service..."
cd nlp-service

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting NLP server on port 5001..."
python app.py