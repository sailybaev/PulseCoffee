#!/bin/bash

# PulseCoffee Barista App - Development Startup Script

echo "🚀 Starting PulseCoffee Barista App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env.local
    echo "✅ Please update .env.local with your API URL if needed"
fi

echo "🏃 Starting development server on port 3002..."
echo "📱 Barista App will be available at: http://localhost:3002"
echo "🔗 For branch setup, use: http://localhost:3002?branch=YOUR_BRANCH_ID"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
