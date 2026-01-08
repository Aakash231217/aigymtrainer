const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Building Athonix PWA for Google Play Store...\n');

// Set environment variable for static export
process.env.EXPORT_MODE = 'static';

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync(path.join(__dirname, 'out'))) {
    fs.rmSync(path.join(__dirname, 'out'), { recursive: true, force: true });
  }

  // Step 2: Build the app with static export
  console.log('🏗️  Building static export...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 3: Ensure the .well-known directory is included in the static export
  console.log('🔄 Ensuring Digital Asset Links file is included...');
  const wellKnownDir = path.join(__dirname, 'out', '.well-known');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }
  
  // Copy assetlinks.json if it doesn't exist in the output
  const sourceAssetlinks = path.join(__dirname, 'public', '.well-known', 'assetlinks.json');
  const targetAssetlinks = path.join(wellKnownDir, 'assetlinks.json');
  
  if (fs.existsSync(sourceAssetlinks) && !fs.existsSync(targetAssetlinks)) {
    fs.copyFileSync(sourceAssetlinks, targetAssetlinks);
  }

  // Step 4: Check for service worker in the output
  console.log('✅ Verifying service worker...');
  if (!fs.existsSync(path.join(__dirname, 'out', 'sw.js'))) {
    console.warn('⚠️  Warning: Service worker not found in output directory.');
    console.warn('   Make sure next-pwa is configured correctly.');
  } else {
    console.log('✅ Service worker found in output.');
  }

  // Step 5: Final message
  console.log('\n✨ Build complete! Your static PWA is ready in the "out" directory.');
  console.log('\nNext steps:');
  console.log('1. Use PWABuilder (https://www.pwabuilder.com/) to package your PWA for Google Play Store');
  console.log('2. Follow the instructions in PWA_PLAYSTORE_INSTRUCTIONS.md');
  console.log('\n');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
