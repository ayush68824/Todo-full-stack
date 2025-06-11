#!/bin/bash

echo "Starting build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install and build frontend
echo "Installing frontend dependencies..."
cd Frontend
npm install

echo "Building frontend..."
npm run build

# Verify the build output
echo "Verifying build output..."
if [ ! -d "dist" ]; then
    echo "Error: Frontend build failed - dist directory not found"
    exit 1
fi

echo "Frontend build successful"

# Go back to root and create public directory
cd ..
echo "Creating public directory..."
mkdir -p public

# Copy files with verbose output
echo "Copying frontend files to public directory..."
cp -rv Frontend/dist/* public/

# Verify the copy
echo "Verifying copied files..."
if [ ! -f "public/index.html" ]; then
    echo "Error: index.html not found in public directory"
    exit 1
fi

echo "Build process completed successfully"
exit 0 