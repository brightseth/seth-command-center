import { auditService } from './audit'

// GitHub API types
interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  repository: {
    name: string
    full_name: string
  }
}

interface GitHubRepo {
  name: string
  full_name: string
  private: boolean
  updated_at: string
  pushed_at: string
  stargazers_count: number
}

interface GitHubStats {
  totalCommits: number
  todayCommits: number
  thisWeekCommits: number
  activeRepos: number
  lastCommitTime: string | null
}

export class GitHubService {
  private apiToken: string
  private username: string

  constructor() {
    this.apiToken = process.env.GITHUB_TOKEN || ''
    this.username = process.env.GITHUB_USERNAME || ''

    if (!this.apiToken) {
      console.warn('GITHUB_TOKEN not set - GitHub integration disabled')
    }
  }

  private async githubRequest(endpoint: string): Promise<any> {
    if (!this.apiToken) {
      throw new Error('GitHub token not configured')
    }

    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `token ${this.apiToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'seth-command-center'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user's repositories
   */
  async getUserRepos(): Promise<GitHubRepo[]> {
    try {
      const repos = await this.githubRequest(`/user/repos?sort=updated&per_page=100`)

      await auditService.log({
        actor: 'github-service',
        action: 'repos.fetch',
        payload: {
          username: this.username,
          repoCount: repos.length
        }
      })

      return repos
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error)
      return []
    }
  }

  /**
   * Get commits for a specific repository
   */
  async getRepoCommits(repo: string, since?: string): Promise<GitHubCommit[]> {
    try {
      let endpoint = `/repos/${repo}/commits?author=${this.username}&per_page=100`
      if (since) {
        endpoint += `&since=${since}`
      }

      const commits = await this.githubRequest(endpoint)

      await auditService.log({
        actor: 'github-service',
        action: 'commits.fetch',
        payload: {
          repo,
          commitCount: commits.length,
          since
        }
      })

      return commits.map((commit: any) => ({
        sha: commit.sha,
        commit: commit.commit,
        repository: { name: repo.split('/')[1], full_name: repo }
      }))
    } catch (error) {
      console.error(`Failed to fetch commits for ${repo}:`, error)
      return []
    }
  }

  /**
   * Get comprehensive GitHub statistics
   */
  async getGitHubStats(): Promise<GitHubStats> {
    try {
      const repos = await this.getUserRepos()
      const activeRepos = repos.filter(repo => {
        const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceUpdate <= 30 // Updated in last 30 days
      })

      // Get commits from last 7 days across all active repos
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const today = new Date().toISOString().split('T')[0]

      let totalCommits = 0
      let todayCommits = 0
      let thisWeekCommits = 0
      let lastCommitTime: string | null = null

      for (const repo of activeRepos.slice(0, 10)) { // Limit to top 10 active repos
        const commits = await this.getRepoCommits(repo.full_name, weekAgo)
        thisWeekCommits += commits.length

        for (const commit of commits) {
          const commitDate = commit.commit.author.date.split('T')[0]
          if (commitDate === today) {
            todayCommits++
          }

          if (!lastCommitTime || commit.commit.author.date > lastCommitTime) {
            lastCommitTime = commit.commit.author.date
          }
        }
      }

      const stats = {
        totalCommits: thisWeekCommits, // For now, just this week's total
        todayCommits,
        thisWeekCommits,
        activeRepos: activeRepos.length,
        lastCommitTime
      }

      await auditService.log({
        actor: 'github-service',
        action: 'stats.compute',
        payload: {
          username: this.username,
          ...stats
        }
      })

      return stats
    } catch (error) {
      console.error('Failed to compute GitHub stats:', error)
      return {
        totalCommits: 0,
        todayCommits: 0,
        thisWeekCommits: 0,
        activeRepos: 0,
        lastCommitTime: null
      }
    }
  }

  /**
   * Sync GitHub data to local database
   */
  async syncToDatabase(): Promise<{ success: boolean; stats: GitHubStats }> {
    try {
      const stats = await this.getGitHubStats()

      // This will be called by a ritual to update KPIs
      // For now, just return the stats

      await auditService.log({
        actor: 'github-service',
        action: 'sync.complete',
        payload: {
          username: this.username,
          syncedAt: new Date().toISOString(),
          ...stats
        }
      })

      return { success: true, stats }
    } catch (error) {
      console.error('GitHub sync failed:', error)
      await auditService.log({
        actor: 'github-service',
        action: 'sync.failed',
        payload: {
          username: this.username,
          error: (error as Error).message
        },
        status: 'failure'
      })

      return {
        success: false,
        stats: {
          totalCommits: 0,
          todayCommits: 0,
          thisWeekCommits: 0,
          activeRepos: 0,
          lastCommitTime: null
        }
      }
    }
  }
}

export const githubService = new GitHubService()