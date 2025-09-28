import { useState } from 'react'

interface Ritual {
  id: string
  name: string
  streak: number
  lastRun: string | null
  enabled: boolean
}

interface AgentHubProps {
  rituals: Ritual[]
  onRitualRun: (ritualId: string) => void
}

export function AgentHub({ rituals, onRitualRun }: AgentHubProps) {
  const [runningRituals, setRunningRituals] = useState<Set<string>>(new Set())

  const handleRitualRun = async (ritualId: string) => {
    setRunningRituals(prev => new Set([...prev, ritualId]))

    try {
      // Simulate ritual execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      onRitualRun(ritualId)
    } finally {
      setRunningRituals(prev => {
        const next = new Set(prev)
        next.delete(ritualId)
        return next
      })
    }
  }

  const canRunRitual = (ritual: Ritual) => {
    if (!ritual.enabled) return false
    if (runningRituals.has(ritual.id)) return false

    // Check if ritual was run recently (within last hour)
    if (ritual.lastRun) {
      const lastRun = new Date(ritual.lastRun)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (lastRun > oneHourAgo) return false
    }

    return true
  }

  const getLastRunText = (lastRun: string | null) => {
    if (!lastRun) return 'Never'

    const date = new Date(lastRun)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white pb-2">
        Agent Hub
      </h2>

      {/* Rituals List */}
      <div className="space-y-4">
        {rituals.map(ritual => {
          const isRunning = runningRituals.has(ritual.id)
          const canRun = canRunRitual(ritual)

          return (
            <div key={ritual.id} className="border border-gray-600 p-4">
              {/* Ritual Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    {ritual.name}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1">
                    Last run: {getLastRunText(ritual.lastRun)}
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {ritual.streak}
                  </div>
                  <div className="text-xs text-gray-400">
                    day streak
                  </div>
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={() => handleRitualRun(ritual.id)}
                disabled={!canRun}
                className={`
                  w-full py-2 px-4 text-sm font-bold uppercase tracking-wider
                  transition-colors
                  ${canRun
                    ? 'border border-white hover:bg-white hover:text-black'
                    : 'border border-gray-600 text-gray-600 cursor-not-allowed'
                  }
                  ${isRunning ? 'animate-pulse' : ''}
                `}
              >
                {isRunning ? 'Running...' :
                 !ritual.enabled ? 'Disabled' :
                 canRun ? 'Run Ritual' : 'Cooldown'}
              </button>

              {/* Status Indicator */}
              <div className="mt-2 text-xs text-center">
                {ritual.enabled ? (
                  <span className="text-green-400">● Active</span>
                ) : (
                  <span className="text-red-400">● Disabled</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Hub Status
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">
              {rituals.filter(r => r.enabled).length}
            </div>
            <div className="text-xs text-gray-400">
              Active Rituals
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {rituals.reduce((sum, r) => sum + r.streak, 0)}
            </div>
            <div className="text-xs text-gray-400">
              Total Streaks
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-2 text-sm">
          {rituals
            .filter(r => r.lastRun)
            .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())
            .slice(0, 3)
            .map(ritual => (
              <div key={ritual.id} className="flex justify-between text-xs">
                <span>{ritual.name}</span>
                <span className="text-gray-400">
                  {getLastRunText(ritual.lastRun)}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}