#!/usr/bin/env tsx
/**
 * Start all file watchers for automatic task ingestion
 *
 * Usage:
 *   npm run watch
 *   # or
 *   tsx scripts/start-watchers.ts
 */

import { ClaudeFilesIngestion } from '../src/services/ingestion/claude-files'
import { GranolaIngestion } from '../src/services/ingestion/granola'

async function startAll() {
  console.log('🚀 Starting all ingestion watchers...\n')

  // Start Claude Code file watcher
  const claudeIngestion = new ClaudeFilesIngestion()
  await claudeIngestion.start()

  // Start Granola meeting notes watcher
  const granolaIngestion = new GranolaIngestion()
  await granolaIngestion.start()

  console.log('\n✅ All watchers running')
  console.log('📝 Watching for:')
  console.log('   - TODO: statements in .md files')
  console.log('   - ACTION: statements')
  console.log('   - Markdown checkboxes [ ]')
  console.log('   - Granola meeting action items')
  console.log('\n💡 Create a TODO in any .md file to test!')
  console.log('   Example: TODO: Test the file watcher')
  console.log('\n⌨️  Press Ctrl+C to stop')

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping watchers...')
    await claudeIngestion.stop()
    await granolaIngestion.stop()
    console.log('✅ Stopped gracefully')
    process.exit(0)
  })

  // Prevent process from exiting
  await new Promise(() => {})
}

startAll().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
