#!/usr/bin/env tsx
/**
 * Test the file watchers by creating a test file
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

async function test() {
  console.log('🧪 Testing file watchers...\n')

  // Create test directory
  const testDir = join(process.cwd(), 'test-ingestion')
  await mkdir(testDir, { recursive: true })

  // Create test markdown file with TODO
  const testFile = join(testDir, 'TEST_TODO.md')
  const testContent = `# Test File for Ingestion

This file tests the automatic TODO ingestion system.

## Test TODOs

TODO: Test the file watcher system
ACTION: Verify task creation
FOLLOW UP: Check task appears in database

- [ ] Test checkbox ingestion
- [ ] Test duplicate detection

## Notes

This file can be deleted after testing.
`

  await writeFile(testFile, testContent)

  console.log('✅ Test file created at:', testFile)
  console.log('\n📝 Contains 5 TODOs to test:')
  console.log('   1. TODO: Test the file watcher system')
  console.log('   2. ACTION: Verify task creation')
  console.log('   3. FOLLOW UP: Check task appears in database')
  console.log('   4. [ ] Test checkbox ingestion')
  console.log('   5. [ ] Test duplicate detection')
  console.log('\n💡 Start the watcher in another terminal:')
  console.log('   npm run watch')
  console.log('\n🔍 Then check your TODO list:')
  console.log('   open http://localhost:3001/command-center/todos')
}

test().catch(console.error)
