'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MonitorData {
  rituals: Array<{
    id: string
    name: string
    enabled: boolean
    cron: string
    lastRun: string | null
    streak: number
    project: { name: string; color: string }
  }>
  jobStats: {
    stats: {
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
      createdAt: string
      startedAt: string | null
      completedAt: string | null
      error: string | null
    }>
  }
  ingestionHealth: {
    sources: Array<{
      id: string
      name: string
      type: string
      enabled: boolean
      lastSync: string | null
      lastSuccess: string | null
      tasksCreated: number
      health: string
      errorLog: string | null
    }>
    health: {
      healthy: number
      total: number
      percentage: number
    }
    recentScans: Array<{
      createdAt: string
      status: string
      payload: string
    }>
  }
  auditLog: {
    logs: Array<{
      id: string
      createdAt: string
      actor: string
      action: string
      status: string
      error: string | null
      payload: string
    }>
    stats: {
      total: number
      successful: number
      failed: number
      successRate: number
    }
  }
}

export default function MonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadMonitorData = async () => {
    try {
      setLoading(true)

      const [rituals, jobStats, ingestionHealth, auditLog] = await Promise.all([
        fetch('/api/rituals').then(r => r.json()),
        fetch('/api/jobs/stats').then(r => r.json()),
        fetch('/api/ingestion/health').then(r => r.json()),
        fetch('/api/audit/recent').then(r => r.json())
      ])

      setData({
        rituals: rituals.success ? rituals.data : [],
        jobStats: jobStats.success ? jobStats.data : { stats: {}, recentJobs: [] },
        ingestionHealth: ingestionHealth.success ? ingestionHealth.data : { sources: [], health: {}, recentScans: [] },
        auditLog: auditLog.success ? auditLog.data : { logs: [], stats: {} }
      })
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Monitor load error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMonitorData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMonitorData, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold uppercase tracking-wider mb-4">Loading Monitor</div>
          <div className="text-sm text-gray-500">Fetching system health...</div>
        </div>
      </div>
    )
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-geist-mono)]">
      {/* Header */}
      <div className="border-b border-white p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-wider">System Monitor</h1>
              <p className="text-sm text-gray-400 mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={loadMonitorData}
                className="px-6 py-3 bg-white text-black uppercase font-bold hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
              <Link
                href="/command-center"
                className="px-6 py-3 border border-white uppercase font-bold hover:bg-white hover:text-black transition-colors"
              >
                Back to Command Center
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rituals Panel */}
          <div className="border border-white p-6">
            <h2 className="text-2xl font-bold uppercase mb-6">Rituals ({data.rituals.length})</h2>
            <div className="space-y-4">
              {data.rituals.map((ritual) => (
                <div key={ritual.id} className="border border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: ritual.project.color }}
                      />
                      <span className="font-bold">{ritual.name}</span>
                    </div>
                    <span className={`text-sm ${ritual.enabled ? 'text-green-400' : 'text-red-400'}`}>
                      {ritual.enabled ? '● ENABLED' : '○ DISABLED'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Schedule: {ritual.cron}</div>
                    <div>Last Run: {formatRelativeTime(ritual.lastRun)}</div>
                    <div>Streak: {ritual.streak} runs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Queue Panel */}
          <div className="border border-white p-6">
            <h2 className="text-2xl font-bold uppercase mb-6">Job Queue</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-700 p-4">
                <div className="text-3xl font-bold">{data.jobStats.stats.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="border border-gray-700 p-4">
                <div className="text-3xl font-bold">{data.jobStats.stats.running}</div>
                <div className="text-sm text-gray-400">Running</div>
              </div>
              <div className="border border-gray-700 p-4">
                <div className="text-3xl font-bold text-green-400">{data.jobStats.stats.completed}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="border border-gray-700 p-4">
                <div className="text-3xl font-bold text-red-400">{data.jobStats.stats.failed}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase mb-3">Recent Jobs</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.jobStats.recentJobs.slice(0, 10).map((job) => (
                <div key={job.id} className="border border-gray-800 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{job.type}</span>
                    <span className={`
                      ${job.status === 'completed' ? 'text-green-400' : ''}
                      ${job.status === 'failed' ? 'text-red-400' : ''}
                      ${job.status === 'running' ? 'text-yellow-400' : ''}
                      ${job.status === 'pending' ? 'text-gray-400' : ''}
                    `}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Created: {formatRelativeTime(job.createdAt)}
                  </div>
                  {job.error && (
                    <div className="text-red-400 mt-1 truncate">Error: {job.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ingestion Health Panel */}
          <div className="border border-white p-6">
            <h2 className="text-2xl font-bold uppercase mb-6">Ingestion Health</h2>
            <div className="mb-6 p-4 border border-gray-700">
              <div className="text-5xl font-bold mb-2">{data.ingestionHealth.health.percentage}%</div>
              <div className="text-sm text-gray-400">
                {data.ingestionHealth.health.healthy} / {data.ingestionHealth.health.total} sources healthy
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase mb-3">Sources</h3>
            <div className="space-y-3">
              {data.ingestionHealth.sources.map((source) => (
                <div key={source.id} className="border border-gray-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{source.name}</span>
                    <span className={`text-xs ${source.health === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                      {source.health.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Type: {source.type}</div>
                    <div>Last Sync: {formatRelativeTime(source.lastSync)}</div>
                    <div>Tasks Created: {source.tasksCreated}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log Panel */}
          <div className="border border-white p-6">
            <h2 className="text-2xl font-bold uppercase mb-6">Audit Log</h2>
            <div className="mb-6 p-4 border border-gray-700">
              <div className="text-3xl font-bold mb-2">{data.auditLog.stats.successRate}%</div>
              <div className="text-sm text-gray-400">
                {data.auditLog.stats.successful} successful / {data.auditLog.stats.total} total operations
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase mb-3">Recent Events</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.auditLog.logs.slice(0, 20).map((log) => (
                <div key={log.id} className="border border-gray-800 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{log.action}</span>
                    <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-500 space-y-1">
                    <div>Actor: {log.actor}</div>
                    <div>Time: {formatRelativeTime(log.createdAt)}</div>
                  </div>
                  {log.error && (
                    <div className="text-red-400 mt-1 truncate">Error: {log.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white p-6 mt-12">
        <div className="max-w-[1600px] mx-auto text-center text-sm text-gray-500">
          <p>Seth Command Center - System Monitoring Dashboard</p>
          <p className="mt-2">Auto-refreshes every 30 seconds</p>
        </div>
      </div>
    </div>
  )
}
