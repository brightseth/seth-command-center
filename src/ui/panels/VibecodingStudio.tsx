interface VibecodingStudioProps {
  manifests: Record<string, { total: number; latestId: string | null }>
}

export function VibecodingStudio({ manifests }: VibecodingStudioProps) {
  const copyClaudeCommand = (projectName: string) => {
    const slug = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const command = `cd /Users/seth/${slug} && claude`
    navigator.clipboard.writeText(command)
  }

  // All vibecoding projects - comprehensive directory
  const projects = [
    // LIVE PLATFORMS
    {
      id: 'vibecodings',
      name: 'Vibecodings Portfolio',
      type: 'Portfolio',
      status: 'LIVE',
      url: 'https://vibecodings.vercel.app',
      description: '52 days • 20+ live sites',
      date: 'Sep 25 2025',
    },
    {
      id: 'solienne-ai',
      name: 'SOLIENNE.ai',
      type: 'Art Platform',
      status: 'LIVE',
      url: 'https://solienne.ai',
      description: 'Paris Photo 2025 • Digital consciousness',
      date: 'Aug 7 2025',
    },
    {
      id: 'eden-academy',
      name: 'Eden Academy',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://eden-academy.eden2.io',
      description: '10 AI agent training ecosystem',
      date: 'Aug 29 2025',
    },
    {
      id: 'miyomi-ai',
      name: 'MIYOMI.ai',
      type: 'Trading',
      status: 'LIVE',
      url: 'https://miyomi.ai',
      description: 'Video Oracle • Trading dashboard',
      date: 'Sep 13 2025',
    },
    {
      id: 'loancast',
      name: 'LoanCast',
      type: 'FinTech',
      status: 'LIVE',
      url: 'https://loancast.app',
      description: 'Social lending platform',
      date: 'Aug 4 2025',
    },
    {
      id: 'node-artist-relations',
      name: 'Node Artist Relations',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://node-artist-relations.vercel.app',
      description: 'Artist relationship management',
      date: 'Sep 2025',
    },
    {
      id: 'nft-brokerage-elite',
      name: 'NFT Brokerage Elite',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://nft-brokerage-elite.vercel.app',
      description: 'High-end NFT brokerage',
      date: 'Sep 2025',
    },
    {
      id: 'abraham-media',
      name: 'Abraham Media Kit',
      type: 'Marketing',
      status: 'LIVE',
      url: 'https://abraham-media.vercel.app',
      description: 'Genesis Sale Oct 6-8',
      date: 'Oct 2025',
    },
    {
      id: 'seth-command-center',
      name: 'Seth Command Center',
      type: 'Tool',
      status: 'LIVE',
      url: 'http://localhost:3001',
      description: 'Personal command center',
      date: 'Oct 2025',
    },
    {
      id: 'pariseye',
      name: 'ParisEye',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://pariseye.vercel.app',
      description: 'Paris cultural guide',
      date: 'Sep 2025',
    },
    {
      id: 'berlineye',
      name: 'BerlinEye',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://berlineye.vercel.app',
      description: 'Berlin cultural guide',
      date: 'Sep 2025',
    },
    {
      id: 'cultureeye',
      name: 'CultureEye',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://cultureeye.vercel.app',
      description: 'Cultural discovery platform',
      date: 'Sep 2025',
    },
    {
      id: 'lore-club',
      name: 'Lore Club',
      type: 'Platform',
      status: 'LIVE',
      url: 'https://lore-club-lmkotmlru-edenprojects.vercel.app',
      description: 'Virgil Abloh exhibition companion • Grand Palais',
      date: 'Oct 2025',
    },

    // CREATIVE TOOLS
    {
      id: 'conductor-suite',
      name: 'Eden Conductor Suite',
      type: 'Tool',
      status: 'LIVE',
      url: 'https://vibecodings.vercel.app/conductor-suite.html',
      description: 'AI creative orchestration',
      date: 'Sep 23 2025',
    },
    {
      id: 'video-generator',
      name: 'Eden Video Generator',
      type: 'Tool',
      status: 'LIVE',
      url: 'https://eden-video-generator.vercel.app',
      description: 'Video generation platform',
      date: 'Sep 20 2025',
    },
    {
      id: 'deck-generator',
      name: 'Chapter 2 Deck',
      type: 'Tool',
      status: 'LIVE',
      url: 'https://chapter-2-deck.vercel.app',
      description: 'Deck viewer',
      date: 'Sep 24 2025',
    },

    // AGENT ECOSYSTEM
    {
      id: 'abraham',
      name: 'Abraham',
      type: 'Agent',
      status: 'LAUNCHING',
      url: 'https://eden-academy.eden2.io/agents/abraham',
      description: 'Collective intelligence artist',
      date: 'Oct 19 2025',
    },

    // PROTOTYPES
    {
      id: 'eden2038',
      name: 'Eden 2038',
      type: 'Prototype',
      status: 'LIVE',
      url: 'https://eden2038.vercel.app',
      description: 'Future vision',
      date: 'Aug 26 2025',
    },
    {
      id: 'design-critic',
      name: 'Design Critic Agent',
      type: 'Prototype',
      status: 'LIVE',
      url: 'https://design-critic-agent.vercel.app',
      description: 'AI design feedback',
      date: 'Aug 22 2025',
    },

    // ARCHIVED / TRAINING
    {
      id: 'citizen',
      name: 'Citizen',
      type: 'Agent',
      status: 'TRAINING',
      url: 'https://eden-academy.eden2.io/agents/citizen',
      description: 'DAO coordinator',
      date: 'Aug 27 2025',
    },
    {
      id: 'bertha',
      name: 'Bertha',
      type: 'Agent',
      status: 'ARCHIVED',
      url: 'https://eden-academy.eden2.io/agents/bertha',
      description: 'Investment strategist',
      date: 'Aug 27 2025',
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
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-white pb-2">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          Vibecoding Projects
        </h2>
        <a
          href="https://vibecodings.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1 border border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider"
        >
          View All
        </a>
      </div>

      {/* Project List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="border border-gray-700 p-3 hover:border-white transition-colors group"
          >
            <div className="flex justify-between items-start">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 hover:opacity-80"
              >
                <h3 className="font-bold text-xs uppercase tracking-wider mb-1">
                  {project.name}
                </h3>
                <div className="text-xs opacity-60">
                  {project.type} • {project.description}
                </div>
              </a>
              <div className="flex items-start gap-2 ml-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyClaudeCommand(project.name)
                  }}
                  className="px-2 py-1 text-xs border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-colors uppercase tracking-wider"
                  title="Copy Claude command"
                >
                  Claude
                </button>
                <div className="text-right">
                  <div className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {project.date.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="border-t border-white pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">
              {projects.length}
            </div>
            <div className="text-xs opacity-60 uppercase tracking-wider">
              Projects
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {projects.filter(p => p.status === 'LIVE').length}
            </div>
            <div className="text-xs opacity-60 uppercase tracking-wider">
              Live
            </div>
          </div>
          <div>
            <div className="text-lg font-bold">
              52
            </div>
            <div className="text-xs opacity-60 uppercase tracking-wider">
              Days
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}