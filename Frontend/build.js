const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the Frontend directory
process.chdir(__dirname);

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Create .env file with API URL
console.log('Creating .env file...');
const envContent = 'VITE_API_URL=https://todo-full-stack-2.onrender.com';
fs.writeFileSync('.env', envContent);

// Run build
console.log('Building frontend...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!'); 