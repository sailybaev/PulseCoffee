#!/bin/bash

# Start the PulseCoffee backend server
echo "Starting PulseCoffee backend server..."
cd /Users/sailybaev/Documents/projects/PulseCoffee/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Start the development server
echo "Starting server in development mode..."
npm run start:dev
