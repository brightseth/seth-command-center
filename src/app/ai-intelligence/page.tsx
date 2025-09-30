'use client'

import { useState } from 'react'

interface ProcessingResult {
  sessionId: string
  source: string
  success: boolean
  intelligence?: {
    projects: string[]
    decisions: string[]
    tasks: string[]
    learnings: string[]
    themes: string[]
    mood?: string
    energy?: string
    priority: string
    nextActions: string[]
  }
  itemsCreated?: {
    tasks: number
    kpis: number
    works: number
  }
  error?: string
}

export default function AIIntelligence() {
  const [conversationText, setConversationText] = useState('')
  const [source, setSource] = useState<'limitless' | 'chatgpt' | 'claude' | 'granola'>('claude')
  const [title, setTitle] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessingResult[]>([])

  const processConversation = async () => {
    if (!conversationText.trim()) return

    setProcessing(true)

    try {
      const conversation = {
        source,
        sessionId: `manual-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: title || 'Manual Upload',
        content: conversationText
      }

      const response = await fetch('/api/ai-sessions/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation)
      })

      const result = await response.json()

      if (result.success) {
        setResults(result.data.results)
        setConversationText('')
        setTitle('')
      } else {
        console.error('Processing failed:', result.error)
        alert('Failed to process conversation. Check console for details.')
      }
    } catch (error) {
      console.error('Failed to process conversation:', error)
      alert('Failed to process conversation. Check console for details.')
    } finally {
      setProcessing(false)
    }
  }

  const testWithMockData = async () => {
    setProcessing(true)

    try {
      const response = await fetch('/api/ai-sessions/ingest')
      const result = await response.json()

      if (result.success) {
        console.log('Mock sync completed:', result)
        alert(`Mock AI session processed: ${result.data.mockSyncResult.processed} conversations`)
      }
    } catch (error) {
      console.error('Mock test failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-helvetica">
      {/* Header */}
      <header className="border-b border-white p-8">
        <h1 className="text-4xl font-bold uppercase tracking-wider">
          AI Intelligence Bridge
        </h1>
        <p className="text-gray-400 mt-2">
          Extract structured intelligence from your AI conversations
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Input Panel */}
        <div className="border border-white p-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
            Conversation Input
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-black border border-white p-3 focus:outline-none focus:border-gray-400"
              >
                <option value="claude">Claude</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="limitless">Limitless</option>
                <option value="granola">Granola</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-white p-3 focus:outline-none focus:border-gray-400"
                placeholder="Conversation title..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Conversation Content
              </label>
              <textarea
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                rows={12}
                className="w-full bg-black border border-white p-3 focus:outline-none focus:border-gray-400 resize-none"
                placeholder="Paste your conversation content here..."
              />
            </div>

            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setConversationText(`Working on seth-command-center project today. Decided to use AI intelligence extraction for better automation. Need to implement more sophisticated parsing algorithms. Learned that context switching is expensive for focus. Feeling productive and ready to scale the system.`)}
                disabled={processing}
                className="border border-gray-500 p-2 text-xs hover:bg-gray-500 hover:text-black transition-colors font-bold uppercase tracking-wide disabled:opacity-50"
              >
                Load Sample Text
              </button>
              <button
                onClick={() => setConversationText('')}
                disabled={processing}
                className="border border-gray-500 p-2 text-xs hover:bg-gray-500 hover:text-black transition-colors font-bold uppercase tracking-wide disabled:opacity-50"
              >
                Clear
              </button>
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={processConversation}
                disabled={processing || !conversationText.trim()}
                className="flex-1 border border-white p-3 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                title={!conversationText.trim() ? 'Enter conversation text to enable' : 'Extract intelligence from conversation'}
              >
                {processing ? 'Processing...' : 'Extract Intelligence'}
              </button>

              <button
                onClick={testWithMockData}
                disabled={processing}
                className="border border-gray-500 p-3 hover:bg-gray-500 hover:text-black transition-colors font-bold uppercase tracking-wide disabled:opacity-50"
              >
                Test Mock
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="border border-white p-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
            Extracted Intelligence
          </h2>

          {results.length === 0 ? (
            <div className="text-gray-400 text-center py-12">
              <p>No conversations processed yet.</p>
              <p className="text-sm mt-2">Upload a conversation to see extracted intelligence.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-600 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold uppercase tracking-wide">
                      {result.source} Session
                    </h3>
                    <span className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>

                  {result.success && result.intelligence && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Projects:</strong> {result.intelligence.projects.join(', ') || 'None'}
                        </div>
                        <div>
                          <strong>Themes:</strong> {result.intelligence.themes.join(', ') || 'None'}
                        </div>
                        <div>
                          <strong>Mood:</strong> {result.intelligence.mood || 'Neutral'}
                        </div>
                        <div>
                          <strong>Priority:</strong> {result.intelligence.priority}
                        </div>
                      </div>

                      {result.intelligence.tasks.length > 0 && (
                        <div className="mt-4">
                          <strong className="block mb-2">Extracted Tasks:</strong>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {result.intelligence.tasks.map((task, i) => (
                              <li key={i}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.intelligence.learnings.length > 0 && (
                        <div className="mt-4">
                          <strong className="block mb-2">Key Learnings:</strong>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {result.intelligence.learnings.map((learning, i) => (
                              <li key={i}>{learning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.itemsCreated && (
                        <div className="mt-4 p-3 bg-gray-900 border border-gray-600">
                          <strong>Items Created:</strong>{' '}
                          {result.itemsCreated.tasks} tasks, {result.itemsCreated.kpis} KPIs, {result.itemsCreated.works} works
                        </div>
                      )}
                    </>
                  )}

                  {!result.success && result.error && (
                    <div className="text-red-400 text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-white p-8 bg-gray-950">
        <h3 className="text-xl font-bold uppercase tracking-wide mb-4">
          Usage Instructions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-bold mb-2">Manual Upload:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy conversation text from Claude/ChatGPT</li>
              <li>Select the source platform</li>
              <li>Paste content and click "Extract Intelligence"</li>
              <li>System automatically creates tasks, KPIs, and insights</li>
            </ol>
          </div>
          <div>
            <h4 className="font-bold mb-2">Extracted Intelligence:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Projects:</strong> Mentioned projects/repositories</li>
              <li><strong>Tasks:</strong> Action items and TODOs</li>
              <li><strong>Decisions:</strong> Key choices made</li>
              <li><strong>Learnings:</strong> New insights discovered</li>
              <li><strong>Themes:</strong> Technical/business topics</li>
              <li><strong>Mood/Energy:</strong> Emotional context</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}