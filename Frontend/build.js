import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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