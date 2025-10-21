import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { readFile } from 'fs/promises'
import { BaseIngestionService, IngestedTask } from './base-ingestion'

export class GranolaIngestion extends BaseIngestionService {
  private watcher: FSWatcher | null = null

  async start() {
    // Update this path to your actual Granola export directory
    const granolaPath = '/Users/seth/Documents/Granola/**/*.md'

    this.watcher = chokidar.watch(granolaPath, {
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
      console.log(`📄 New Granola meeting: ${filePath}`)
      await this.processMeeting(filePath)
    })

    this.watcher.on('change', async (filePath) => {
      console.log(`📝 Granola meeting updated: ${filePath}`)
      await this.processMeeting(filePath)
    })

    console.log('✅ Granola meeting notes watcher started')
    console.log('   Watching:', granolaPath)
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
      console.log('🛑 Granola watcher stopped')
    }
  }

  private async processMeeting(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8')

      // Extract meeting metadata
      const meetingTitle = this.extractMeetingTitle(content)
      const meetingDate = this.extractMeetingDate(content, filePath)

      // Extract action items
      const actionItems = this.extractActionItems(content)

      if (actionItems.length > 0) {
        console.log(`   Found ${actionItems.length} action item(s) from: "${meetingTitle}"`)
      }

      for (const item of actionItems) {
        const result = await this.createTask({
          ...item,
          source: 'granola',
          sourceContext: {
            source: 'granola',
            meetingTitle,
            meetingDate,
            filePath,
            processedAt: new Date().toISOString()
          },
          tags: ['granola', 'meeting']
        } as IngestedTask)

        if (result.created) {
          console.log(`   ✅ Created task: "${result.task.title}"`)
        } else {
          console.log(`   ⚠️  Task already exists (mention count: ${result.task.mentionCount})`)
        }
      }
    } catch (error: any) {
      // Silently handle file not found (directory might not exist yet)
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error processing meeting ${filePath}:`, error)
      }
    }
  }

  private extractMeetingTitle(content: string): string {
    // Granola usually puts meeting title as first # heading
    const match = content.match(/^#\s+(.+)/m)
    return match ? match[1].trim() : 'Untitled Meeting'
  }

  private extractMeetingDate(content: string, filePath: string): string {
    // Try to find date in content first
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/)
    if (dateMatch) return dateMatch[0]

    // Fallback to filename
    const filenameDate = filePath.match(/\d{4}-\d{2}-\d{2}/)
    if (filenameDate) return filenameDate[0]

    return new Date().toISOString().split('T')[0]
  }

  private extractActionItems(content: string): Partial<IngestedTask>[] {
    const items: Partial<IngestedTask>[] = []

    // Granola formats action items as:
    // - [ ] Action item
    // Action Items:
    // - Item

    // Pattern 1: Markdown checkboxes
    const checkboxPattern = /- \[ \]\s*(.+)/gi
    let match
    while ((match = checkboxPattern.exec(content)) !== null) {
      const title = match[1].trim()
      if (title.length > 5 && title.length < 200) {
        items.push({
          title,
          priority: 2,
          extractedFrom: match[0]
        })
      }
    }

    // Pattern 2: Action Items section
    const actionSection = content.match(/(?:Action Items?|Follow[- ]?Ups?):?\s*\n((?:- .+\n?)+)/i)
    if (actionSection) {
      const actionLines = actionSection[1].match(/- (.+)/gi)
      if (actionLines) {
        for (const line of actionLines) {
          const title = line.replace(/^- /, '').trim()
          if (title.length > 5 && title.length < 200 && !items.some(i => i.title === title)) {
            items.push({
              title,
              priority: 2,
              extractedFrom: line
            })
          }
        }
      }
    }

    // Pattern 3: Next Steps section
    const nextStepsSection = content.match(/(?:Next Steps?):?\s*\n((?:- .+\n?)+)/i)
    if (nextStepsSection) {
      const stepLines = nextStepsSection[1].match(/- (.+)/gi)
      if (stepLines) {
        for (const line of stepLines) {
          const title = line.replace(/^- /, '').trim()
          if (title.length > 5 && title.length < 200 && !items.some(i => i.title === title)) {
            items.push({
              title,
              priority: 2,
              extractedFrom: line
            })
          }
        }
      }
    }

    return items
  }
}
