#!/usr/bin/env tsx
/**
 * Simple test to verify chokidar is working
 */

import chokidar from 'chokidar'

console.log('🧪 Testing chokidar directly...\n')

const watcher = chokidar.watch('/Users/seth/seth-command-center/**/*.md', {
  ignored: /(node_modules|\.git|dist|build)/,
  persistent: true,
  ignoreInitial: false
})

watcher.on('add', (path) => {
  console.log(`📄 File detected: ${path}`)
})

watcher.on('change', (path) => {
  console.log(`📝 File changed: ${path}`)
})

watcher.on('error', (error) => {
  console.error(`❌ Watcher error:`, error)
})

watcher.on('ready', () => {
  console.log('✅ Watcher is ready and has processed initial files')
})

console.log('Watching /Users/seth/seth-command-center/**/*.md\n')
console.log('Press Ctrl+C to stop')

process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping...')
  watcher.close()
  process.exit(0)
})
