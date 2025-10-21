'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle, Clock, Zap, TrendingUp, XCircle } from 'lucide-react'

interface MonitorData {
  overview: {
    systemHealth: {
      score: number
      status: 'healthy' | 'degraded' | 'critical'
    }
    queue: {
      total: number
      pending: number
      running: number
      completed: number
      failed: number
    }
    rituals: {
      total: number
      enabled: number
      late: number
    }
    activity: {
      last24Hours: number
      ritualRuns: number
      jobFailures: number
    }
    alerts: Array<{
      severity: 'info' | 'warning' | 'error'
      message: string
      type: string
    }>
  }
  jobs: {
    queueStats: {
      pending: number
      running: number
      completed: number
      failed: number
      totalJobs: number
    }
    recentJobs: Array<{
      id: string
      type: string
      status: string
      attempts: number
      maxRetries: number
      runAt: string
      createdAt: string
      error: string | null
      executionTime: number | null
    }>
    metrics: {
      avgExecutionTimeMs: number
      failedJobsLast24h: number
      pendingJobsOlderThan1h: number
      successRate: string
    }
  }
  rituals: {
    rituals: Array<{
      id: string
      name: string
      project: string
      streak: number
      lastRun: string | null
      enabled: boolean
      health: 'healthy' | 'late' | 'disabled'
      hoursSinceLastRun: string | null
    }>
    stats: {
      totalRituals: number
      enabledRituals: number
      healthyRituals: number
      lateRituals: number
      executionsLast30Days: number
    }
  }
}

export default function MonitorDashboard() {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadMonitoringData = async () => {
    try {
      setLoading(true)

      const [overviewRes, jobsRes, ritualsRes] = await Promise.all([
        fetch('/api/monitor/overview'),
        fetch('/api/monitor/jobs?limit=20'),
        fetch('/api/monitor/rituals?limit=30'),
      ])

      const [overview, jobs, rituals] = await Promise.all([
        overviewRes.json(),
        jobsRes.json(),
        ritualsRes.json(),
      ])

      setData({
        overview: overview.data,
        jobs: jobs.data,
        rituals: rituals.data,
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMonitoringData()

    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <div className="text-2xl font-bold uppercase tracking-wider">Loading Monitor</div>
        </div>
      </div>
    )
  }

  const { overview, jobs, rituals } = data

  return (
    <div className="min-h-screen bg-black text-white font-helvetica">
      {/* Header */}
      <header className="border-b border-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider">System Monitor</h1>
            <p className="text-sm text-gray-400 mt-1">Real-time ritual and job queue monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-gray-400">Last Update</div>
              <div className="font-mono">{lastRefresh.toLocaleTimeString()}</div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 border ${autoRefresh ? 'bg-white text-black' : 'border-white'} transition-colors text-xs uppercase tracking-wider`}
            >
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button
              onClick={loadMonitoringData}
              className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
            >
              Refresh
            </button>
            <a
              href="/command-center"
              className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
            >
              Command Center
            </a>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Health Score */}
          <div className="border border-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold">System Health</h3>
              {overview.systemHealth.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {overview.systemHealth.status === 'degraded' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
              {overview.systemHealth.status === 'critical' && <XCircle className="w-5 h-5 text-red-400" />}
            </div>
            <div className="text-4xl font-bold mb-2">{overview.systemHealth.score}/100</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">{overview.systemHealth.status}</div>
          </div>

          {/* Queue Stats */}
          <div className="border border-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold">Job Queue</h3>
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-4xl font-bold mb-2">{overview.queue.total}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending:</span>
                <span>{overview.queue.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Running:</span>
                <span>{overview.queue.running}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Failed:</span>
                <span className={overview.queue.failed > 0 ? 'text-red-400' : ''}>{overview.queue.failed}</span>
              </div>
            </div>
          </div>

          {/* Ritual Stats */}
          <div className="border border-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold">Rituals</h3>
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-4xl font-bold mb-2">{overview.rituals.enabled}/{overview.rituals.total}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Enabled:</span>
                <span>{overview.rituals.enabled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Late:</span>
                <span className={overview.rituals.late > 0 ? 'text-yellow-400' : ''}>{overview.rituals.late}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="border border-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wider font-bold">Last 24h</h3>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-4xl font-bold mb-2">{overview.activity.last24Hours}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Ritual Runs:</span>
                <span>{overview.activity.ritualRuns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Job Failures:</span>
                <span className={overview.activity.jobFailures > 0 ? 'text-red-400' : ''}>{overview.activity.jobFailures}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {overview.alerts.length > 0 && (
          <div className="border border-white p-6">
            <h3 className="text-sm uppercase tracking-wider font-bold mb-4">Active Alerts</h3>
            <div className="space-y-2">
              {overview.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 border ${
                    alert.severity === 'error' ? 'border-red-400' :
                    alert.severity === 'warning' ? 'border-yellow-400' :
                    'border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alert.severity === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                    {alert.severity === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                    {alert.severity === 'info' && <Activity className="w-4 h-4 text-blue-400" />}
                    <span className="text-sm">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout: Rituals + Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ritual History */}
          <div className="border border-white">
            <div className="border-b border-white p-4">
              <h2 className="text-xl font-bold uppercase tracking-wider">Ritual Status</h2>
              <p className="text-xs text-gray-400 mt-1">
                {rituals.stats.healthyRituals} healthy • {rituals.stats.lateRituals} late • {rituals.stats.executionsLast30Days} runs (30d)
              </p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {rituals.rituals.map((ritual) => (
                  <div key={ritual.id} className="border border-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold uppercase tracking-wider">{ritual.name}</div>
                        <div className="text-xs text-gray-400">{ritual.project}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ritual.health === 'healthy' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {ritual.health === 'late' && <Clock className="w-4 h-4 text-yellow-400" />}
                        {ritual.health === 'disabled' && <XCircle className="w-4 h-4 text-gray-500" />}
                        <span className={`text-xs uppercase ${
                          ritual.health === 'healthy' ? 'text-green-400' :
                          ritual.health === 'late' ? 'text-yellow-400' :
                          'text-gray-500'
                        }`}>
                          {ritual.health}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Streak</div>
                        <div className="font-mono text-lg">{ritual.streak}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Last Run</div>
                        <div className="font-mono">
                          {ritual.lastRun
                            ? `${ritual.hoursSinceLastRun}h ago`
                            : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Queue */}
          <div className="border border-white">
            <div className="border-b border-white p-4">
              <h2 className="text-xl font-bold uppercase tracking-wider">Job Queue</h2>
              <p className="text-xs text-gray-400 mt-1">
                {jobs.metrics.successRate}% success rate • {jobs.metrics.avgExecutionTimeMs}ms avg time
              </p>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {jobs.recentJobs.map((job) => (
                  <div key={job.id} className="border border-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold uppercase tracking-wider text-sm">{job.type}</div>
                        <div className="text-xs text-gray-400 font-mono">{job.id.slice(0, 12)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {job.status === 'running' && <Activity className="w-4 h-4 text-blue-400 animate-pulse" />}
                        {job.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                        {job.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                        <span className={`text-xs uppercase ${
                          job.status === 'completed' ? 'text-green-400' :
                          job.status === 'running' ? 'text-blue-400' :
                          job.status === 'pending' ? 'text-gray-400' :
                          'text-red-400'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">Attempts</div>
                        <div className="font-mono">{job.attempts}/{job.maxRetries}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Duration</div>
                        <div className="font-mono">
                          {job.executionTime ? `${job.executionTime}ms` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Created</div>
                        <div className="font-mono">
                          {new Date(job.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {job.error && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-400">
                        <div className="text-xs text-red-400 font-mono">{job.error}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="fixed bottom-4 right-4 text-xs opacity-50 hover:opacity-100 transition-opacity">
        <a
          href="https://vibecodings.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:underline"
        >
          vibecoded by @seth
        </a>
      </div>
    </div>
  )
}
