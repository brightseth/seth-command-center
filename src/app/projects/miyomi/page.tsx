'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MiyomiUpdate {
  lastUpdated: string
  status: string
  keyChanges: Array<{ title: string; old: string; new: string }>
  newFormats: Array<{ name: string; description: string; file: string }>
  partnerships: Array<{ name: string; priority: string; reason: string; status: string; file: string }>
  nextActions: Array<{ action: string; file?: string; timeline?: string; priority: string }>
}

export default function MiyomiProject() {
  const [data, setData] = useState<MiyomiUpdate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects/miyomi')
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setData(result.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load MIYOMI data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading MIYOMI updates...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-500">Failed to load MIYOMI data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-helvetica">
      {/* Header */}
      <header className="border-b border-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wider">MIYOMI Project</h1>
            <p className="text-sm mt-2 text-gray-400">Strategic Updates Dashboard</p>
          </div>
          <Link
            href="/command-center"
            className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
          >
            ← Back to Command Center
          </Link>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Status Banner */}
        <div className="mb-8 p-6 border border-green-500 bg-green-500/10">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold uppercase tracking-wider text-green-500">
                {data.status}
              </div>
              <div className="text-sm text-gray-400 mt-1">Last Updated: {data.lastUpdated}</div>
            </div>
            <div className="text-5xl">✅</div>
          </div>
        </div>

        {/* Key Changes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            Key Messaging Changes
          </h2>
          <div className="space-y-6">
            {data.keyChanges.map((change, i) => (
              <div key={i} className="border border-white p-6">
                <h3 className="text-xl font-bold mb-4">{change.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-red-400 uppercase tracking-wide mb-2">Before</div>
                    <div className="text-gray-300 line-through">{change.old}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-400 uppercase tracking-wide mb-2">After</div>
                    <div className="text-white font-bold">{change.new}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Formats */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            New Content Formats
          </h2>
          <div className="space-y-4">
            {data.newFormats.map((format, i) => (
              <div key={i} className="border border-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{format.name}</h3>
                    <p className="text-gray-300">{format.description}</p>
                  </div>
                  <a
                    href={`/Users/seth/miyomi-vercel/${format.file}`}
                    className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
                  >
                    View Doc
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partnerships */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            Strategic Partnerships
          </h2>
          <div className="space-y-4">
            {data.partnerships.map((partner, i) => (
              <div key={i} className="border border-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{partner.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className={`${partner.priority === 'HIGH' ? 'text-red-400' : 'text-yellow-400'} font-bold`}>
                        {partner.priority} PRIORITY
                      </span>
                      <span className="text-gray-400">{partner.status}</span>
                    </div>
                  </div>
                  <a
                    href={`/Users/seth/miyomi-vercel/${partner.file}`}
                    className="px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
                  >
                    View Outreach
                  </a>
                </div>
                <p className="text-gray-300">{partner.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            Next Actions
          </h2>
          <div className="space-y-3">
            {data.nextActions.map((action, i) => (
              <div key={i} className="border border-white p-4 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="font-bold">{action.action}</span>
                    {action.priority === 'IMMEDIATE' && (
                      <span className="text-xs px-2 py-1 bg-red-500 text-white">IMMEDIATE</span>
                    )}
                    {action.priority === 'HIGH' && (
                      <span className="text-xs px-2 py-1 bg-yellow-500 text-black">HIGH</span>
                    )}
                  </div>
                  {action.timeline && (
                    <div className="text-sm text-gray-400 ml-9 mt-1">{action.timeline}</div>
                  )}
                </div>
                {action.file && (
                  <a
                    href={`/Users/seth/miyomi-vercel/${action.file}`}
                    className="text-xs text-blue-400 hover:underline ml-4"
                  >
                    View →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            Quick Reference
          </h2>
          <div className="border border-white p-6 bg-white/5">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Core Positioning</h3>
              <p className="text-gray-300 italic">
                "MIYOMI is THE personality teaching prediction mastery in the AI era through public contrarian stands in prediction markets."
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">One-Liner</h3>
              <p className="text-gray-300">
                "I teach you to be predictive of the game, not predicted by the game. Join me upstream."
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Key Documents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                  <span>STRATEGIC_UPDATES_OCT_11_2025.md</span>
                  <span className="text-yellow-400">⭐ START HERE</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                  <span>PREDICTION_PATH_SCREENSHOT_FORMAT.md</span>
                  <span className="text-gray-400">New content format</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                  <span>KALSHI_PARTNERSHIP_OUTREACH.md</span>
                  <span className="text-gray-400">Email templates</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-700">
                  <span>A16Z_PREDICTION_MARKETS_STRATEGY.md</span>
                  <span className="text-gray-400">Strategy basis</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Commands */}
        <section>
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-white pb-4 mb-6">
            Quick Terminal Access
          </h2>
          <div className="bg-gray-900 border border-gray-700 p-6 font-mono text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-gray-400"># Navigate to MIYOMI project</span>
                <div className="text-green-400">cd /Users/seth/miyomi-vercel</div>
              </div>
              <div className="mt-4">
                <span className="text-gray-400"># Open strategic summary</span>
                <div className="text-green-400">open STRATEGIC_UPDATES_OCT_11_2025.md</div>
              </div>
              <div className="mt-4">
                <span className="text-gray-400"># Open Kalshi outreach</span>
                <div className="text-green-400">open KALSHI_PARTNERSHIP_OUTREACH.md</div>
              </div>
              <div className="mt-4">
                <span className="text-gray-400"># View all new docs</span>
                <div className="text-green-400">ls -lt *.md | head -5</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
