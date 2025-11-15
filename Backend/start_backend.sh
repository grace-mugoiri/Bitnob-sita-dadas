#!/bin/bash

# HoldPay Backend Quick Start Script
# This script sets up and starts the Flask backend

echo "=================================================="
echo "🚀 HoldPay Backend Setup"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install Flask==3.0.0 flask-socketio==5.3.5 flask-cors==4.0.0 \
    python-socketio==5.10.0 python-engineio==4.8.0 eventlet==0.33.3 \
    requests==2.31.0

echo "✓ Dependencies installed"

# Check if app.py exists
if [ ! -f "app.py" ]; then
    echo "❌ app.py not found. Please create app.py with the Flask backend code."
    exit 1
fi

echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo "Starting Flask server..."
echo ""

# Start the Flask application
python3 app.py