interface VibecodingStudioProps {
  manifests: Record<string, { total: number; latestId: string | null }>
}

export function VibecodingStudio({ manifests }: VibecodingStudioProps) {
  // Project cards data - from our vibecoding directory knowledge
  const projects = [
    {
      id: 'eden-academy',
      name: 'Eden Academy',
      type: 'Platform',
      status: 'LIVE',
      works: manifests.eden?.total || 0,
      url: 'https://academy.eden2.io',
      description: '10 AI agents ecosystem',
      fire: 5,
    },
    {
      id: 'solienne-gallery',
      name: 'SOLIENNE Gallery',
      type: 'Art',
      status: 'LIVE',
      works: 5694, // From our SOLIENNE data
      url: 'https://solienne.vercel.app',
      description: '5.7K consciousness explorations',
      fire: 5,
    },
    {
      id: 'conductor-suite',
      name: 'Conductor Suite',
      type: 'Tool',
      status: 'LIVE',
      works: manifests.vibecoding?.total || 0,
      url: 'https://vibecodings.vercel.app/conductor-v2.html',
      description: 'Creative intelligence orchestration',
      fire: 4,
    },
    {
      id: 'deck-generator',
      name: 'Deck Generator',
      type: 'Tool',
      status: 'READY',
      works: 0,
      url: null,
      description: '$50/deck or $200/mo unlimited',
      fire: 4,
    },
    {
      id: 'video-generator',
      name: 'Video Generator',
      type: 'Tool',
      status: 'READY',
      works: 0,
      url: null,
      description: '$100/mo for creators',
      fire: 4,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-400'
      case 'READY': return 'text-yellow-400'
      case 'DEV': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getFireDisplay = (count: number) => {
    return '🔥'.repeat(count)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white pb-2">
        Vibecoding Studio
      </h2>

      {/* Project Cards */}
      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="border border-gray-600 p-4 hover:border-white transition-colors">
            {/* Project Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  {project.name}
                </h3>
                <div className="text-xs text-gray-400 mt-1">
                  {project.type} • {project.description}
                </div>
              </div>

              {/* Status & Fire */}
              <div className="text-right">
                <div className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
                <div className="text-xs mt-1">
                  {getFireDisplay(project.fire)}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">
                <span className="text-gray-400">Works:</span>
                <span className="ml-2 font-bold">
                  {project.works.toLocaleString()}
                </span>
              </div>

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider"
                >
                  Visit
                </a>
              )}
            </div>

            {/* Publish Toggle */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Published:</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={project.status === 'LIVE'}
                  readOnly
                  className="w-4 h-4"
                />
                <span className={project.status === 'LIVE' ? 'text-green-400' : 'text-gray-400'}>
                  {project.status === 'LIVE' ? 'Live' : 'Draft'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Studio Stats */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Studio Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {projects.filter(p => p.status === 'LIVE').length}
            </div>
            <div className="text-xs text-gray-400">
              Live Projects
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {projects.reduce((sum, p) => sum + p.works, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              Total Works
            </div>
          </div>
        </div>
      </div>

      {/* Recent Outputs */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Recent Outputs
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>SOLIENNE consciousness stream</span>
            <span className="text-xs text-gray-400">2h ago</span>
          </div>
          <div className="flex justify-between">
            <span>Abraham covenant draft</span>
            <span className="text-xs text-gray-400">1d ago</span>
          </div>
          <div className="flex justify-between">
            <span>Portfolio update v2</span>
            <span className="text-xs text-gray-400">2d ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-white pt-6 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full py-2 px-4 text-xs font-bold uppercase tracking-wider border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-colors">
            Deploy Latest
          </button>
          <button className="w-full py-2 px-4 text-xs font-bold uppercase tracking-wider border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}