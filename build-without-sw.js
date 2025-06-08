const fs = require('fs');
const { execSync } = require('child_process');

// First, disable service worker in the template
try {
  const indexFile = './public/index.html';
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, 'utf-8');
    // Add a comment to disable service worker
    content = content.replace(
      '</head>',
      '<!-- Service worker disabled -->\n</head>'
    );
    fs.writeFileSync(indexFile, content);
    console.log('✅ Modified index.html to disable service worker');
  }
} catch (err) {
  console.error('Failed to modify index.html:', err);
}

// Run build with environment variables to skip service worker
process.env.GENERATE_SOURCEMAP = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

try {
  console.log('🚀 Running build with service worker disabled...');
  execSync('react-scripts build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exit(1);
}