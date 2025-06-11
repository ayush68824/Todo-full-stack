const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure we're in the project root
process.chdir(__dirname);

// Install root dependencies
console.log('Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install and build frontend
console.log('Installing and building frontend...');
process.chdir(path.join(__dirname, 'Frontend'));
execSync('npm install', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });

// Create dist directory in root if it doesn't exist
const rootDistDir = path.join(__dirname, 'dist');
if (!fs.existsSync(rootDistDir)) {
  fs.mkdirSync(rootDistDir);
}

// Copy frontend build to root dist
console.log('Copying frontend build to root dist...');
const frontendDistDir = path.join(__dirname, 'Frontend', 'dist');
fs.cpSync(frontendDistDir, rootDistDir, { recursive: true });

console.log('Build completed successfully!'); 