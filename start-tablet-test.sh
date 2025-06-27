#!/bin/bash

echo "🚀 Starting Pulse Tablet App for testing..."

# Check if backend is running
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/products/public)
if [ "$BACKEND_STATUS" != "200" ]; then
    echo "❌ Backend not running! Please start the backend first."
    echo "   Run: npm run start:dev from the backend directory"
    exit 1
fi

echo "✅ Backend is running"

# Start the tablet app
cd /Users/sailybaev/Documents/projects/PulseCoffee/frontend/pulse-tablet

echo "📦 Installing dependencies if needed..."
npm install --silent

echo "🖥️ Starting tablet app on http://localhost:4321"
echo ""
echo "💡 To test customizations:"
echo "   1. Go to http://localhost:4321"
echo "   2. Click on any coffee product (e.g., Американо, Капучино)"
echo "   3. You should see customization options like:"
echo "      - Размер (CUP_SIZE): 250мл (+0), 350мл (+100), 450мл (+200)"  
echo "      - Тип молока (MILK_TYPE): various milk options"
echo "      - Сироп (SYRUP): various syrups (+100 each)"
echo "      - And more..."
echo ""

npm run dev
