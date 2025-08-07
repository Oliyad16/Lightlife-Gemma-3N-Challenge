#!/usr/bin/env tsx

/**
 * Build check script for LifeLight Gemma 3N Challenge
 * Validates project configuration and dependencies before build
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Running build checks...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    process.exit(1);
  }
}

// Check TypeScript configuration
console.log('\n📝 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'));
  if (tsConfig.compilerOptions?.strict) {
    console.log('✅ TypeScript strict mode enabled');
  } else {
    console.warn('⚠️  TypeScript strict mode not enabled');
  }
} catch (error) {
  console.error('❌ Failed to parse tsconfig.json');
  process.exit(1);
}

// Check Next.js configuration
console.log('\n⚙️  Checking Next.js configuration...');
try {
  const nextConfig = readFileSync('next.config.ts', 'utf-8');
  if (nextConfig.includes('output: \'export\'')) {
    console.log('✅ Static export configured');
  }
  if (nextConfig.includes('experimental')) {
    console.log('✅ Experimental features enabled');
  }
} catch (error) {
  console.error('❌ Failed to read next.config.ts');
  process.exit(1);
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['next', 'react', 'react-dom', '@mlc-ai/web-llm'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep} found`);
    } else {
      console.warn(`⚠️  ${dep} not found in dependencies`);
    }
  }
} catch (error) {
  console.error('❌ Failed to parse package.json');
  process.exit(1);
}

console.log('\n🎉 Build checks completed successfully!');
console.log('Ready to build the LifeLight Gemma 3N application.'); 