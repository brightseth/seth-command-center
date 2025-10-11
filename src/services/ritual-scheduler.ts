import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface RitualConfig {
  name: string
  description: string
  command: string
  schedule: string // "fridays", "daily", "mondays", etc.
  time: string // "09:00"
  enabled: boolean
  projects: string[]
  safety_checks?: {
    check_git_status?: boolean
    query_open_tasks?: boolean
    dry_run_first?: boolean
    add_archive_footer?: boolean
    never_auto_commit?: boolean
  }
  post_actions?: string[]
}

interface RitualsYaml {
  rituals: RitualConfig[]
  config: {
    auto_archive_days: number
    log_pattern: string
    archive_footer: string
    notifications: Record<string, boolean>
    safety: Record<string, boolean>
  }
}

export class RitualScheduler {
  private configPath: string
  private config: RitualsYaml | null = null

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'config', 'rituals.yaml')
  }

  /**
   * Load rituals.yaml configuration
   */
  loadConfig(): RitualsYaml {
    try {
      const fileContents = fs.readFileSync(this.configPath, 'utf8')
      this.config = yaml.load(fileContents) as RitualsYaml
      return this.config
    } catch (error) {
      console.error('Failed to load rituals.yaml:', error)
      throw new Error(`Could not load rituals config: ${error}`)
    }
  }

  /**
   * Check if a ritual should run today
   */
  shouldRunToday(ritual: RitualConfig): boolean {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sunday, 5=Friday
    const schedule = ritual.schedule.toLowerCase()

    const scheduleMap: Record<string, number[]> = {
      'daily': [0, 1, 2, 3, 4, 5, 6],
      'weekdays': [1, 2, 3, 4, 5],
      'weekends': [0, 6],
      'mondays': [1],
      'tuesdays': [2],
      'wednesdays': [3],
      'thursdays': [4],
      'fridays': [5],
      'saturdays': [6],
      'sundays': [0]
    }

    const allowedDays = scheduleMap[schedule]
    if (!allowedDays) {
      console.warn(`Unknown schedule: ${schedule}`)
      return false
    }

    return allowedDays.includes(dayOfWeek)
  }

  /**
   * Check if it's time to run a ritual
   */
  isTimeToRun(ritual: RitualConfig): boolean {
    const now = new Date()
    const [hours, minutes] = ritual.time.split(':').map(Number)

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Run within 5-minute window
    return currentHour === hours && Math.abs(currentMinute - minutes) <= 5
  }

  /**
   * Execute a ritual command
   */
  async executeRitual(ritual: RitualConfig): Promise<{
    success: boolean
    output?: string
    error?: string
  }> {
    try {
      console.log(`[Ritual] Executing: ${ritual.name}`)
      console.log(`[Ritual] Command: ${ritual.command}`)

      // Log ritual start
      await prisma.auditLog.create({
        data: {
          actor: 'system',
          action: 'ritual.started',
          payload: JSON.stringify({
            ritual: ritual.name,
            command: ritual.command,
            projects: ritual.projects
          }),
          status: 'success'
        }
      })

      // Execute command
      const { stdout, stderr } = await execAsync(ritual.command, {
        cwd: process.cwd(),
        env: { ...process.env },
        timeout: 30000 // 30 second timeout
      })

      console.log(`[Ritual] Success: ${ritual.name}`)
      console.log(`[Ritual] Output:`, stdout)

      // Log ritual completion
      await prisma.auditLog.create({
        data: {
          actor: 'system',
          action: 'ritual.completed',
          payload: JSON.stringify({
            ritual: ritual.name,
            output: stdout.substring(0, 500) // First 500 chars
          }),
          status: 'success'
        }
      })

      // Run post-actions if defined
      if (ritual.post_actions) {
        for (const action of ritual.post_actions) {
          await this.executePostAction(action, ritual)
        }
      }

      return { success: true, output: stdout }

    } catch (error) {
      console.error(`[Ritual] Failed: ${ritual.name}`, error)

      // Log ritual failure
      await prisma.auditLog.create({
        data: {
          actor: 'system',
          action: 'ritual.failed',
          payload: JSON.stringify({
            ritual: ritual.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          status: 'failure',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute post-action after ritual completes
   */
  private async executePostAction(action: string, ritual: RitualConfig): Promise<void> {
    try {
      if (action.startsWith('trigger:')) {
        const command = action.replace('trigger:', '').trim()
        console.log(`[Ritual] Post-action: ${command}`)
        await execAsync(command)
      } else if (action.startsWith('log:')) {
        console.log(`[Ritual] Post-action logging: ${action}`)
        // Logging handled by main ritual execution
      } else if (action.startsWith('notify:')) {
        console.log(`[Ritual] Post-action notification: ${action}`)
        // Future: Send notifications
      }
    } catch (error) {
      console.error(`[Ritual] Post-action failed:`, error)
    }
  }

  /**
   * Check and run all scheduled rituals
   */
  async checkAndRunRituals(): Promise<{
    checked: number
    executed: number
    results: Array<{ ritual: string; success: boolean; output?: string; error?: string }>
  }> {
    const config = this.loadConfig()
    const results: Array<{ ritual: string; success: boolean; output?: string; error?: string }> = []
    let executed = 0

    for (const ritual of config.rituals) {
      if (!ritual.enabled) {
        console.log(`[Scheduler] Skipping disabled ritual: ${ritual.name}`)
        continue
      }

      if (!this.shouldRunToday(ritual)) {
        console.log(`[Scheduler] Not scheduled for today: ${ritual.name}`)
        continue
      }

      if (!this.isTimeToRun(ritual)) {
        console.log(`[Scheduler] Not time yet: ${ritual.name} (scheduled for ${ritual.time})`)
        continue
      }

      console.log(`[Scheduler] Running ritual: ${ritual.name}`)
      const result = await this.executeRitual(ritual)

      results.push({
        ritual: ritual.name,
        success: result.success,
        output: result.output,
        error: result.error
      })

      if (result.success) executed++
    }

    return {
      checked: config.rituals.length,
      executed,
      results
    }
  }
}

// Export singleton instance
export const ritualScheduler = new RitualScheduler()
