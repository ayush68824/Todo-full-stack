#!/bin/bash

# Install backend dependencies
npm install

# Install and build frontend
cd Frontend
npm install
npm run build
cd ..

# Create public directory and copy files
mkdir -p public
cp -r Frontend/dist/* public/

# Exit with success
exit 0 