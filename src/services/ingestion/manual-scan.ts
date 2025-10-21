import { ClaudeFilesIngestion } from './claude-files'
import { GranolaIngestion } from './granola'
import { readdir } from 'fs/promises'
import { join } from 'path'

export interface ScanResult {
  success: boolean
  scannedFiles: number
  tasksCreated: number
  tasksUpdated: number
  errors: string[]
  duration: number
}

export class ManualScanService {
  private claudeIngestion = new ClaudeFilesIngestion()
  private granolaIngestion = new GranolaIngestion()

  async scanAll(): Promise<ScanResult> {
    const startTime = Date.now()
    const result: ScanResult = {
      success: true,
      scannedFiles: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      errors: [],
      duration: 0
    }

    console.log('🔍 Starting manual scan of all directories...\n')

    // Scan Claude Code directories
    const claudeResults = await this.scanClaudeDirectories()
    result.scannedFiles += claudeResults.scannedFiles
    result.tasksCreated += claudeResults.tasksCreated
    result.tasksUpdated += claudeResults.tasksUpdated
    result.errors.push(...claudeResults.errors)

    // Scan Granola directory
    const granolaResults = await this.scanGranolaDirectory()
    result.scannedFiles += granolaResults.scannedFiles
    result.tasksCreated += granolaResults.tasksCreated
    result.tasksUpdated += granolaResults.tasksUpdated
    result.errors.push(...granolaResults.errors)

    result.duration = Date.now() - startTime
    result.success = result.errors.length === 0

    console.log(`\n✅ Scan complete: ${result.scannedFiles} files, ${result.tasksCreated} created, ${result.tasksUpdated} updated`)
    if (result.errors.length > 0) {
      console.log(`⚠️  ${result.errors.length} errors encountered`)
    }

    return result
  }

  private async scanClaudeDirectories(): Promise<Omit<ScanResult, 'success' | 'duration'>> {
    const result = {
      scannedFiles: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      errors: [] as string[]
    }

    const directories = [
      '/Users/seth/solienne.ai',
      '/Users/seth/eden-dev',
      '/Users/seth/seth-command-center',
      '/Users/seth/pariseye',
      '/Users/seth/SOLIENNE_VISION_2025'
    ]

    for (const dir of directories) {
      console.log(`📂 Scanning: ${dir}`)
      try {
        const scanResult = await this.scanDirectory(dir, '.md', async (filePath) => {
          return await (this.claudeIngestion as any).processFile(filePath)
        })
        result.scannedFiles += scanResult.scannedFiles
        result.tasksCreated += scanResult.tasksCreated
        result.tasksUpdated += scanResult.tasksUpdated
      } catch (error: any) {
        const errMsg = `Error scanning ${dir}: ${error.message}`
        result.errors.push(errMsg)
        console.error(`❌ ${errMsg}`)
      }
    }

    return result
  }

  private async scanGranolaDirectory(): Promise<Omit<ScanResult, 'success' | 'duration'>> {
    const result = {
      scannedFiles: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      errors: [] as string[]
    }

    const granolaDir = '/Users/seth/Documents/Granola'
    console.log(`📂 Scanning: ${granolaDir}`)

    try {
      const scanResult = await this.scanDirectory(granolaDir, '.md', async (filePath) => {
        return await (this.granolaIngestion as any).processMeeting(filePath)
      })
      result.scannedFiles += scanResult.scannedFiles
      result.tasksCreated += scanResult.tasksCreated
      result.tasksUpdated += scanResult.tasksUpdated
    } catch (error: any) {
      const errMsg = `Error scanning ${granolaDir}: ${error.message}`
      result.errors.push(errMsg)
      console.error(`❌ ${errMsg}`)
    }

    return result
  }

  private async scanDirectory(
    dir: string,
    extension: string,
    processor: (filePath: string) => Promise<void>
  ): Promise<Omit<ScanResult, 'success' | 'duration'>> {
    const result = {
      scannedFiles: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      errors: [] as string[]
    }

    try {
      const files = await this.getFilesRecursive(dir, extension)

      for (const file of files) {
        try {
          result.scannedFiles++
          await processor(file)
          // Note: We don't track created/updated here as the processor handles that internally
        } catch (error: any) {
          result.errors.push(`${file}: ${error.message}`)
        }
      }
    } catch (error: any) {
      // Directory might not exist, silently handle
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    return result
  }

  private async getFilesRecursive(dir: string, extension: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        // Skip ignored directories
        if (entry.isDirectory()) {
          if (/(node_modules|\.git|dist|build)/.test(entry.name)) {
            continue
          }
          const subFiles = await this.getFilesRecursive(fullPath, extension)
          files.push(...subFiles)
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(fullPath)
        }
      }
    } catch (error: any) {
      // Silently handle permission errors
      if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
        throw error
      }
    }

    return files
  }
}
