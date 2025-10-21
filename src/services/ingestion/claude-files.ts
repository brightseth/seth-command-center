import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { readFile } from 'fs/promises'
import { BaseIngestionService, IngestedTask } from './base-ingestion'

export class ClaudeFilesIngestion extends BaseIngestionService {
  private watcher: FSWatcher | null = null

  async start() {
    const paths = [
      '/Users/seth/solienne.ai/**/*.md',
      '/Users/seth/eden-dev/**/*.md',
      '/Users/seth/seth-command-center/**/*.md',
      '/Users/seth/pariseye/**/*.md',
      '/Users/seth/SOLIENNE_VISION_2025/**/*.md'
    ]

    this.watcher = chokidar.watch(paths, {
      ignored: /(node_modules|\.git|dist|build)/,
      persistent: true,
      ignoreInitial: false,
      usePolling: true,      // Use polling on macOS for Claude Code Write tool
      interval: 2000,        // Check every 2 seconds
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    })

    this.watcher.on('add', async (filePath) => {
      console.log(`📄 New file detected: ${filePath}`)
      await this.processFile(filePath)
    })

    this.watcher.on('change', async (filePath) => {
      console.log(`📝 File changed: ${filePath}`)
      await this.processFile(filePath)
    })

    console.log('✅ Claude Code file watcher started')
    console.log('   Watching:', paths)
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
      console.log('🛑 Claude Code file watcher stopped')
    }
  }

  private async processFile(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8')

      // Extract TODOs
      const todos = this.extractTodos(content, filePath)

      if (todos.length > 0) {
        console.log(`   Found ${todos.length} TODO(s) in ${filePath}`)
      }

      for (const todo of todos) {
        const result = await this.createTask(todo)
        if (result.created) {
          console.log(`   ✅ Created task: "${result.task.title}"`)
        } else {
          console.log(`   ⚠️  Task already exists (mention count: ${result.task.mentionCount})`)
        }
      }
    } catch (error) {
      console.error(`❌ Error processing file ${filePath}:`, error)
    }
  }

  private extractTodos(content: string, filePath: string): IngestedTask[] {
    const todos: IngestedTask[] = []

    // Patterns to detect
    const patterns = [
      { regex: /TODO:\s*(.+)/gi, type: 'TODO' },
      { regex: /ACTION:\s*(.+)/gi, type: 'ACTION' },
      { regex: /FOLLOW[- ]UP:\s*(.+)/gi, type: 'FOLLOW UP' },
      { regex: /- \[ \]\s*(.+)/gi, type: 'CHECKBOX' },
      { regex: /\*\*TODO\*\*:\s*(.+)/gi, type: 'TODO' }
    ]

    // Infer project from path
    const projectName = this.inferProject(filePath)

    for (const { regex, type } of patterns) {
      let match
      while ((match = regex.exec(content)) !== null) {
        const title = match[1].trim()

        // Skip very short or very long (probably not a task)
        if (title.length < 5 || title.length > 200) continue

        // Skip if it looks like a comment about TODOs
        if (title.toLowerCase().includes('no todo') ||
            title.toLowerCase().includes('all done') ||
            title.toLowerCase().startsWith('list')) continue

        // Get surrounding context (100 chars before and after)
        const startPos = Math.max(0, match.index - 100)
        const endPos = Math.min(content.length, match.index + match[0].length + 100)
        const context = content.slice(startPos, endPos)

        todos.push({
          title,
          notes: `Extracted from: ${filePath}\nType: ${type}`,
          projectName,
          priority: this.inferPriority(title),
          source: 'claude-code',
          sourceContext: {
            source: 'claude-code',
            filePath,
            detectedAt: new Date().toISOString(),
            pattern: type
          },
          extractedFrom: context,
          tags: ['claude-code', type.toLowerCase()]
        })
      }
    }

    return todos
  }

  private inferProject(filePath: string): string {
    if (filePath.includes('solienne')) return 'SOLIENNE'
    if (filePath.includes('eden-dev')) return 'Eden'
    if (filePath.includes('command-center')) return 'seth'
    if (filePath.includes('pariseye')) return 'ParisEye'
    if (filePath.includes('miyomi') || filePath.includes('MIYOMI')) return 'MIYOMI'
    if (filePath.includes('SOLIENNE_VISION')) return 'SOLIENNE'
    return 'seth'
  }

  private inferPriority(title: string): 1 | 2 | 3 {
    const lower = title.toLowerCase()
    if (lower.includes('urgent') || lower.includes('critical') ||
        lower.includes('asap') || lower.includes('!!!')) {
      return 1
    }
    if (lower.includes('nice to have') || lower.includes('eventually') ||
        lower.includes('someday')) {
      return 3
    }
    return 2
  }
}
