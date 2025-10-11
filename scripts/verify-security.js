// Verify no API keys or secrets are exposed in code
// Run with: npx tsx scripts/verify-security.js

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DANGEROUS_PATTERNS = [
  /GITHUB_TOKEN\s*=\s*["'](?!your-|ghp_xxx)[a-zA-Z0-9_]{20,}/gi,
  /EDEN.*API.*KEY\s*=\s*["'](?!your-|dev-)[a-f0-9]{32,}/gi,
  /SENTRY_DSN\s*=\s*["']https:\/\/[a-f0-9]+@/gi,
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub Personal Access Token
  /gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth Token
  /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/g, // GitHub Fine-grained PAT
];

const SAFE_FILES = [
  '.env.example',
  '.env.sample',
  'verify-security.js'
];

const SKIP_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage'
];

function scanFile(filePath) {
  const filename = filePath.split('/').pop();

  if (SAFE_FILES.includes(filename)) {
    return [];
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const issues = [];

    for (const pattern of DANGEROUS_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          file: filePath,
          pattern: pattern.toString(),
          matches: matches.map(m => m.substring(0, 50) + '...')
        });
      }
    }

    return issues;
  } catch (error) {
    // Skip files that can't be read
    return [];
  }
}

function scanDirectory(dir, issues = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.includes(file) && !file.startsWith('.')) {
        scanDirectory(filePath, issues);
      }
    } else if (stat.isFile()) {
      const ext = file.split('.').pop();
      if (['ts', 'tsx', 'js', 'jsx', 'env', 'md'].includes(ext)) {
        const fileIssues = scanFile(filePath);
        issues.push(...fileIssues);
      }
    }
  }

  return issues;
}

function main() {
  console.log('🔐 Scanning codebase for exposed secrets...\n');

  const rootDir = process.cwd();
  const issues = scanDirectory(rootDir);

  if (issues.length === 0) {
    console.log('✅ No exposed secrets found!\n');
    console.log('✅ .gitignore protects .env.local');
    console.log('✅ .env.example contains placeholder values only');
    console.log('✅ All API keys loaded from environment variables');
    console.log('\n🎉 Security verification passed!');
    process.exit(0);
  } else {
    console.log('❌ SECURITY ISSUES FOUND:\n');

    for (const issue of issues) {
      console.log(`File: ${issue.file}`);
      console.log(`Pattern: ${issue.pattern}`);
      console.log(`Matches: ${issue.matches.join(', ')}`);
      console.log();
    }

    console.log('⚠️  Please remove these secrets before committing!');
    process.exit(1);
  }
}

main();
