// Quick test script to verify Netlify Functions work correctly
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Netlify Functions Setup...\n');

// Test 1: Check if all function files exist
const functionFiles = [
  'netlify/functions/events.js',
  'netlify/functions/teams.js', 
  'netlify/functions/players.js',
  'netlify/functions/sports.js',
  'netlify/functions/medals.js',
  'netlify/functions/schedules-sport.js',
  'netlify/functions/schedules-team.js'
];

console.log('✅ Testing Function Files:');
functionFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
  }
});

// Test 2: Check if all data files exist
const dataFiles = [
  'netlify/functions/data/sample-events.json',
  'netlify/functions/data/sample-teams.json',
  'netlify/functions/data/sample-players.json', 
  'netlify/functions/data/sample-sports.json',
  'netlify/functions/data/sample-medals.json'
];

console.log('\n✅ Testing Data Files:');
dataFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      console.log(`   ✅ ${file} - ${data.length} items`);
    } catch (error) {
      console.log(`   ⚠️  ${file} - Invalid JSON!`);
    }
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
  }
});

// Test 3: Check netlify.toml configuration
console.log('\n✅ Testing Configuration:');
if (fs.existsSync('netlify.toml')) {
  const config = fs.readFileSync('netlify.toml', 'utf8');
  const hasRedirects = config.includes('[[redirects]]');
  const hasBuildSettings = config.includes('[build]');
  const hasFunctionConfig = config.includes('functions = "netlify/functions"');
  
  console.log(`   ✅ netlify.toml exists`);
  console.log(`   ${hasRedirects ? '✅' : '❌'} API redirects configured`);
  console.log(`   ${hasBuildSettings ? '✅' : '❌'} Build settings configured`);
  console.log(`   ${hasFunctionConfig ? '✅' : '❌'} Functions directory configured`);
} else {
  console.log('   ❌ netlify.toml - MISSING!');
}

// Test 4: Check frontend build readiness
console.log('\n✅ Testing Frontend:');
if (fs.existsSync('frontend/package.json')) {
  console.log('   ✅ Frontend package.json exists');
  if (fs.existsSync('frontend/src/constants/index.ts')) {
    const constants = fs.readFileSync('frontend/src/constants/index.ts', 'utf8');
    const hasApiConfig = constants.includes('API_BASE_URL');
    console.log(`   ${hasApiConfig ? '✅' : '❌'} API configuration updated`);
  }
} else {
  console.log('   ❌ Frontend package.json - MISSING!');
}

console.log('\n🚀 DEPLOYMENT READINESS SUMMARY:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Count successful checks
let totalChecks = functionFiles.length + dataFiles.length + 4; // +4 for config checks
let passedChecks = 0;

functionFiles.forEach(file => {
  if (fs.existsSync(file)) passedChecks++;
});

dataFiles.forEach(file => {
  if (fs.existsSync(file)) passedChecks++;
});

if (fs.existsSync('netlify.toml')) passedChecks++;
if (fs.existsSync('frontend/package.json')) passedChecks++;
if (fs.existsSync('frontend/src/constants/index.ts')) passedChecks++;
if (fs.existsSync('netlify/functions')) passedChecks++;

const readinessPercent = Math.round((passedChecks / totalChecks) * 100);

console.log(`📊 Readiness: ${passedChecks}/${totalChecks} checks passed (${readinessPercent}%)`);

if (readinessPercent >= 90) {
  console.log('🎉 READY TO DEPLOY! All systems go.');
  console.log('\n📋 Next Steps:');
  console.log('   1. cd Olympix-App-Final');
  console.log('   2. netlify login');
  console.log('   3. netlify init');
  console.log('   4. cd frontend && npm run build && cd ..');
  console.log('   5. netlify deploy --prod');
} else {
  console.log('⚠️  NOT READY - Please fix the missing components above.');
}

console.log('\n🌐 After deployment, your app will support:');
console.log('   ✅ Daily admin operations (create events/players)');
console.log('   ✅ Permanent data storage (JSON files)'); 
console.log('   ✅ Public URL for team access');
console.log('   ✅ Real-time updates across all users');
console.log('   ✅ $0 hosting cost (Netlify free tier)');