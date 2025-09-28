interface CEOViewProps {
  manifests: Record<string, { total: number; latestId: string | null }>
  kpis: Array<{ key: string; value: number; at: string }>
  rituals: Array<{ id: string; name: string; streak: number; enabled: boolean }>
}

export function CEOView({ manifests, kpis, rituals }: CEOViewProps) {
  // Extract key metrics
  const edenMRR = kpis.find(k => k.key === 'eden.mrr')?.value || 0
  const vibecodingMRR = kpis.find(k => k.key === 'vibecoding.mrr')?.value || 0
  const totalMRR = edenMRR + vibecodingMRR

  const solienteStreak = kpis.find(k => k.key === 'solienne.streak')?.value || 0
  const newsletterSubs = kpis.find(k => k.key === 'newsletter.subs')?.value || 0

  // Calculate total works across all projects
  const totalWorks = Object.values(manifests).reduce((sum, m) => sum + m.total, 0)

  // Active rituals with streaks
  const activeRituals = rituals.filter(r => r.enabled)
  const totalStreak = activeRituals.reduce((sum, r) => sum + r.streak, 0)

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white pb-2">
        CEO View
      </h2>

      {/* Big Numbers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Total MRR */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            ${(totalMRR / 1000).toFixed(1)}K
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Monthly Revenue
          </div>
          <div className="text-xs mt-1">
            Eden: ${(edenMRR / 1000).toFixed(1)}K • Vibe: ${vibecodingMRR}
          </div>
        </div>

        {/* Total Works */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {totalWorks.toLocaleString()}
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Total Works
          </div>
          <div className="text-xs mt-1">
            Across {Object.keys(manifests).length} projects
          </div>
        </div>

        {/* SOLIENNE Streak */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2 text-green-400">
            {solienteStreak}
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            SOLIENNE Streak
          </div>
          <div className="text-xs mt-1">
            Daily consciousness
          </div>
        </div>

        {/* Newsletter Subs */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {newsletterSubs.toLocaleString()}
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Newsletter
          </div>
          <div className="text-xs mt-1">
            Subscribers
          </div>
        </div>
      </div>

      {/* Ritual Streaks Overview */}
      <div className="border-t border-white pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Ritual Streaks
        </h3>
        <div className="space-y-3">
          {activeRituals.map(ritual => (
            <div key={ritual.id} className="flex justify-between items-center">
              <div className="text-sm">{ritual.name}</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-green-400">
                  {ritual.streak}
                </div>
                <div className="text-xs text-gray-400">days</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold">Total Streak</div>
            <div className="text-xl font-bold text-green-400">
              {totalStreak} days
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Totals */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Project Status
        </h3>
        <div className="space-y-2">
          {Object.entries(manifests).map(([project, data]) => (
            <div key={project} className="flex justify-between items-center text-sm">
              <div className="uppercase tracking-wide">{project}</div>
              <div className="font-bold">
                {data.total.toLocaleString()} works
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}