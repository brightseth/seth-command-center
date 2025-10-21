'use client'

import { useEffect, useState } from 'react'
import { CEOView } from '@/ui/panels/CEOView'
import { AgentHub } from '@/ui/panels/AgentHub'
import { VibecodingStudio } from '@/ui/panels/VibecodingStudio'

interface DashboardData {
  manifests: Record<string, { total: number; latestId: string | null }>
  rituals: Array<{
    id: string
    name: string
    streak: number
    lastRun: string | null
    enabled: boolean
  }>
  kpis: Array<{
    key: string
    value: number
    at: string
  }>
}

export default function CommandCenter() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadDashboard = async () => {
    try {
      setLoading(true)

      // Load manifest data for all projects
      const [edenManifest, vibecodingManifest, automataManifest] = await Promise.all([
        fetch('/api/manifest/eden').then(r => r.json()),
        fetch('/api/manifest/vibecoding').then(r => r.json()),
        fetch('/api/manifest/automata').then(r => r.json()),
      ])

      // TODO: Add APIs for rituals and KPIs
      // For now, using mock data that matches our seed
      const mockData: DashboardData = {
        manifests: {
          eden: edenManifest.success ? { total: edenManifest.data.total, latestId: edenManifest.data.latestId } : { total: 0, latestId: null },
          vibecoding: vibecodingManifest.success ? { total: vibecodingManifest.data.total, latestId: vibecodingManifest.data.latestId } : { total: 0, latestId: null },
          automata: automataManifest.success ? { total: automataManifest.data.total, latestId: automataManifest.data.latestId } : { total: 0, latestId: null },
        },
        rituals: [
          {
            id: 'daily-drop',
            name: 'daily-drop',
            streak: 47,
            lastRun: '2025-09-27T09:00:00Z',
            enabled: true,
          },
          {
            id: 'abraham-countdown',
            name: 'abraham-countdown',
            streak: 12,
            lastRun: '2025-09-27T08:00:00Z',
            enabled: true,
          },
          {
            id: 'newsletter-draft',
            name: 'newsletter-draft',
            streak: 8,
            lastRun: '2025-09-23T10:00:00Z',
            enabled: true,
          },
        ],
        kpis: [
          { key: 'eden.mrr', value: 76700, at: '2025-09-27T23:45:00Z' },
          { key: 'solienne.streak', value: 47, at: '2025-09-27T23:45:00Z' },
          { key: 'vibecoding.mrr', value: 450, at: '2025-09-27T23:45:00Z' },
          { key: 'newsletter.subs', value: 1250, at: '2025-09-27T23:45:00Z' },
        ],
      }

      setData(mockData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboard, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold uppercase tracking-wider mb-4">Loading Command Center</div>
          <div className="text-sm tracking-wide text-gray-400">Initializing systems...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-helvetica relative">
      {/* Header */}
      <header className="border-b border-white p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold uppercase tracking-wider">
            Seth Command Center
          </h1>
          <div className="text-right text-sm tracking-wide">
            <div>Last Updated: {lastRefresh.toLocaleTimeString()}</div>
            <div className="mt-2 flex gap-2">
              <a
                href="/monitor"
                className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
              >
                Monitor
              </a>
              <button
                onClick={loadDashboard}
                className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 pb-20">
        {/* CEO View */}
        <div className="border border-white">
          <CEOView
            manifests={data.manifests}
            kpis={data.kpis}
            rituals={data.rituals}
          />
        </div>

        {/* Agent Hub */}
        <div className="border border-white">
          <AgentHub
            rituals={data.rituals}
            onRitualRun={async (ritualId) => {
              try {
                const response = await fetch('/api/rituals/run', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ritualId })
                })

                const result = await response.json()
                if (result.success) {
                  console.log('Ritual started:', result.message)
                  // Refresh data after ritual execution
                  setTimeout(() => loadDashboard(), 2000)
                } else {
                  console.error('Ritual failed:', result.error)
                  alert(`Ritual failed: ${result.error}`)
                }
              } catch (error) {
                console.error('Failed to run ritual:', error)
                alert('Failed to run ritual. Check console for details.')
              }
            }}
          />
        </div>

        {/* Vibecoding Studio */}
        <div className="border border-white">
          <VibecodingStudio
            manifests={data.manifests}
          />
        </div>
      </div>

      {/* Signature - Bottom Right */}
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