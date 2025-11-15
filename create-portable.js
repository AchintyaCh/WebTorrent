#!/usr/bin/env node

// Create portable distribution without electron-builder
const fs = require('fs');
const path = require('path');

console.log('📦 Creating Portable P2P File Sharing Distribution...\n');

try {
    // Create distribution folder
    const distName = 'P2P-File-Sharing-Portable';
    const distPath = path.join('..', distName);

    console.log('1. Creating distribution folder...');
    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
    }
    fs.mkdirSync(distPath, { recursive: true });

    // Copy essential files
    console.log('2. Copying application files...');

    // Copy src folder
    fs.cpSync('src', path.join(distPath, 'src'), { recursive: true });
    console.log('   ✅ src/');

    // Copy package.json
    fs.copyFileSync('package.json', path.join(distPath, 'package.json'));
    console.log('   ✅ package.json');

    // Copy node_modules if exists
    if (fs.existsSync('node_modules')) {
        console.log('   📦 Copying node_modules (this may take a while)...');
        fs.cpSync('node_modules', path.join(distPath, 'node_modules'), { recursive: true });
        console.log('   ✅ node_modules/');
    } else {
        console.log('   ⚠️  node_modules not found - will need npm install on target machine');
    }

    // Create start script
    console.log('3. Creating start scripts...');

    // Windows batch file
    const startBat = `@echo off
echo Starting P2P Blockchain File Sharing...
echo.
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)
echo Launching application...
npm run dev
pause`;

    fs.writeFileSync(path.join(distPath, 'start.bat'), startBat);
    console.log('   ✅ start.bat');

    // Linux/Mac shell script
    const startSh = `#!/bin/bash
echo "Starting P2P Blockchain File Sharing..."
echo
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi
echo "Launching application..."
npm run dev`;

    fs.writeFileSync(path.join(distPath, 'start.sh'), startSh);
    console.log('   ✅ start.sh');

    // README for users
    const readme = `# P2P Blockchain File Sharing - Portable Version

## Quick Start

### Windows:
1. Double-click "start.bat"
2. Wait for the app to launch
3. Connect your MetaMask wallet

### Linux/Mac:
1. Open terminal in this folder
2. Run: chmod +x start.sh
3. Run: ./start.sh
4. Connect your MetaMask wallet

## Requirements

- Node.js 16+ installed
- MetaMask browser extension
- Internet connection for DHT peer discovery

## Features

- ✅ Tracker-less P2P file sharing
- ✅ Blockchain-based peer discovery
- ✅ MetaMask wallet integration
- ✅ Real-time download progress
- ✅ Cross-platform compatibility

## Testing Between Machines

1. Copy this entire folder to different machines
2. Run the start script on each machine
3. Connect different MetaMask accounts
4. Upload files on one machine, download on another
5. Watch pure DHT peer discovery work!

## Troubleshooting

- If "npm not found": Install Node.js first
- If MetaMask not detected: Install MetaMask browser extension
- If no peers found: Wait 1-2 minutes for DHT discovery
- If build issues: This portable version bypasses all build problems!

Enjoy your decentralized file sharing! 🌐
`;

    fs.writeFileSync(path.join(distPath, 'README.md'), readme);
    console.log('   ✅ README.md');

    console.log('\n🎉 Portable distribution created successfully!');
    console.log(`📁 Location: ${distName}/`);
    console.log('\n📋 Distribution ready:');
    console.log('1. Copy the entire folder to other machines');
    console.log('2. Users run "start.bat" (Windows) or "./start.sh" (Linux/Mac)');
    console.log('3. App launches automatically with full P2P functionality');
    console.log('\n🚀 No build complications - just pure P2P file sharing!');

} catch (error) {
    console.error('\n❌ Failed to create portable distribution:', error.message);
}