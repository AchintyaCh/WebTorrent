#!/usr/bin/env node

// Build script for creating Windows .exe
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building P2P Blockchain File Sharing .exe...\n');

// Step 1: Verify dependencies
console.log('1. Checking dependencies...');
try {
    execSync('npm list electron-builder', { stdio: 'pipe' });
    console.log('✅ electron-builder found');
} catch (error) {
    console.log('📦 Installing electron-builder...');
    execSync('npm install electron-builder --save-dev', { stdio: 'inherit' });
}

// Step 2: Clean previous builds
console.log('\n2. Cleaning previous builds...');
try {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
        console.log('✅ Cleaned dist folder');
    }
} catch (error) {
    console.log('⚠️  Could not clean dist folder:', error.message);
}

// Step 3: Update package.json for production build
console.log('\n3. Preparing build configuration...');
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Ensure build configuration
packageJson.build = {
    "appId": "com.p2p.blockchain.filesharing",
    "productName": "P2P Blockchain File Sharing",
    "directories": {
        "output": "dist",
        "buildResources": "build"
    },
    "files": [
        "src/**/*",
        "node_modules/**/*",
        "package.json"
    ],
    "win": {
        "target": "nsis",
        "icon": "build/icon.ico"
    },
    "nsis": {
        "oneClick": false,
        "allowToChangeInstallationDirectory": true,
        "createDesktopShortcut": true,
        "createStartMenuShortcut": true
    }
};

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Build configuration updated');

// Step 4: Create icon (if not exists)
console.log('\n4. Checking build assets...');
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

const iconPath = path.join(buildDir, 'icon.ico');
if (!fs.existsSync(iconPath)) {
    console.log('⚠️  No icon found, creating placeholder...');
    // Create a simple text file as placeholder
    fs.writeFileSync(iconPath, 'Placeholder icon file');
}

// Step 5: Build the .exe
console.log('\n5. Building Windows executable...');
console.log('This may take several minutes...\n');

try {
    execSync('npx electron-builder --win', {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });

    console.log('\n🎉 Build completed successfully!');
    console.log('\n📁 Output files:');

    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`   📦 ${file} (${size} MB)`);
        });
    }

    console.log('\n🚀 Ready for distribution!');
    console.log('📋 Next steps:');
    console.log('1. Copy the .exe to different machines');
    console.log('2. Install MetaMask on each machine');
    console.log('3. Connect to same blockchain network');
    console.log('4. Test P2P file sharing between machines');

} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have Visual Studio Build Tools installed');
    console.log('2. Try: npm install --global windows-build-tools');
    console.log('3. Or install Visual Studio Community with C++ tools');
}