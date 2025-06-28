#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧪 Testing SafeHaven build process...\n');

try {
  // Test 1: Check if package.json is valid
  console.log('1. Checking package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json is valid');
  console.log(`   - Name: ${packageJson.name}`);
  console.log(`   - Version: ${packageJson.version}`);
  console.log(`   - Type: ${packageJson.type}`);
  
  // Test 2: Check if Tailwind config is valid
  console.log('\n2. Checking Tailwind configuration...');
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  if (tailwindConfig.includes('export default')) {
    console.log('✅ Tailwind config is in ES module format');
  } else {
    console.log('❌ Tailwind config is not in ES module format');
  }
  
  // Test 3: Check if PostCSS config is valid
  console.log('\n3. Checking PostCSS configuration...');
  const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8');
  if (postcssConfig.includes('export default')) {
    console.log('✅ PostCSS config is in ES module format');
  } else {
    console.log('❌ PostCSS config is not in ES module format');
  }
  
  // Test 4: Check if CSS file exists
  console.log('\n4. Checking CSS file...');
  if (fs.existsSync('web/styles.css')) {
    console.log('✅ CSS file exists');
    const cssContent = fs.readFileSync('web/styles.css', 'utf8');
    if (cssContent.includes('@tailwind')) {
      console.log('✅ Tailwind directives are present');
    } else {
      console.log('❌ Tailwind directives are missing');
    }
  } else {
    console.log('❌ CSS file does not exist');
  }
  
  // Test 5: Check if HTML template exists
  console.log('\n5. Checking HTML template...');
  if (fs.existsSync('web/index.html')) {
    console.log('✅ HTML template exists');
    const htmlContent = fs.readFileSync('web/index.html', 'utf8');
    if (htmlContent.includes('styles.css')) {
      console.log('✅ CSS link is present in HTML');
    } else {
      console.log('❌ CSS link is missing from HTML');
    }
  } else {
    console.log('❌ HTML template does not exist');
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\nTo build the project, run:');
  console.log('  npm run build:css-prod  # Build CSS only');
  console.log('  npm run build:web      # Build full web app');
  console.log('  npm run serve          # Serve the built app');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 