#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file
echo "Creating .env file..."
echo "VITE_API_URL=https://todo-full-stack-2.onrender.com" > .env

# Run build
echo "Building frontend..."
npm run build

echo "Build completed successfully!" 