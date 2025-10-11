interface CEOViewProps {
  manifests: Record<string, { total: number; latestId: string | null }>
  kpis: Array<{ key: string; value: number; at: string }>
  rituals: Array<{ id: string; name: string; streak: number; enabled: boolean }>
}

export function CEOView({ manifests, kpis }: CEOViewProps) {
  // Real metrics that matter
  const deployedSites = 29 // From actual Vercel deployments
  const daysOfCreation = 62 // Aug 4 - Oct 5, 2025
  const totalWorks = Object.values(manifests).reduce((sum, m) => sum + m.total, 0)

  // Upcoming deadlines
  const deadlines = [
    { name: 'Abraham Genesis Sale', date: 'Oct 6-8, 2025', daysAway: 1, status: 'URGENT' },
    { name: 'SOLIENNE Paris Photo', date: 'Nov 10, 2025', daysAway: 36, status: 'UPCOMING' },
    { name: 'MIYOMI Launch', date: 'Mid-Dec 2025', daysAway: 70, status: 'PLANNING' },
  ]

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white pb-2">
        Overview
      </h2>

      {/* Real Numbers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Deployed Sites */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2 text-green-400">
            {deployedSites}
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Deployed Sites
          </div>
          <div className="text-xs mt-1">
            Live on Vercel
          </div>
        </div>

        {/* Days of Creation */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {daysOfCreation}
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Days Creating
          </div>
          <div className="text-xs mt-1">
            Aug 4 - Oct 5
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
            {Object.keys(manifests).length} projects
          </div>
        </div>

        {/* Active Projects */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2 text-yellow-400">
            3
          </div>
          <div className="text-sm uppercase tracking-wider text-gray-400">
            Active Now
          </div>
          <div className="text-xs mt-1">
            Abraham, MIYOMI, Seth CC
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="border-t border-white pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {deadlines.map((deadline, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold">{deadline.name}</div>
                <div className="text-xs text-gray-400">{deadline.date}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  deadline.status === 'URGENT' ? 'text-red-400' :
                  deadline.status === 'UPCOMING' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {deadline.status}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {deadline.daysAway} days
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Abraham media kit deployed</span>
            <span className="text-gray-400">Today</span>
          </div>
          <div className="flex justify-between">
            <span>MIYOMI onboarding pages live</span>
            <span className="text-gray-400">Today</span>
          </div>
          <div className="flex justify-between">
            <span>Seth Command Center built</span>
            <span className="text-gray-400">Today</span>
          </div>
          <div className="flex justify-between">
            <span>Architecture evolved (ADR-022 deprecated)</span>
            <span className="text-gray-400">Today</span>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Key Projects
        </h3>
        <div className="space-y-2">
          {Object.entries(manifests).map(([project, data]) => (
            <div key={project} className="flex justify-between items-center text-sm">
              <div className="uppercase tracking-wide">{project}</div>
              <div className="font-bold">
                {data.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
