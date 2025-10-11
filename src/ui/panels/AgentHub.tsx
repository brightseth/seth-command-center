import { useEffect, useState } from 'react'

interface Todo {
  id: string
  title: string
  priority: number
  status: string
  project: {
    name: string
  }
}

interface Ritual {
  id: string
  name: string
  streak: number
  lastRun: string | null
  enabled: boolean
}

interface AgentHubProps {
  rituals?: Ritual[]
  onRitualRun?: (ritualId: string) => Promise<void>
}

export function AgentHub(props: AgentHubProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTodos(data.data.todos)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getPriorityColor = (priority: number) => {
    // priority: 1 = high, 2 = medium, 3 = low
    switch (priority) {
      case 1: return 'text-red-400'
      case 2: return 'text-yellow-400'
      case 3: return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'HIGH'
      case 2: return 'MEDIUM'
      case 3: return 'LOW'
      default: return 'UNKNOWN'
    }
  }

  const activeTodos = todos.filter(t => t.status === 'open' || t.status === 'doing')
  const completedToday = todos.filter(t => t.status === 'done')

  const urgentCount = todos.filter(t => t.priority === 1 && t.status !== 'done').length
  const highCount = todos.filter(t => t.priority === 2 && t.status !== 'done').length

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white pb-2">
        TODOs
      </h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center border border-gray-600 p-3">
          <div className="text-2xl font-bold text-red-400">
            {urgentCount}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            High Priority
          </div>
        </div>
        <div className="text-center border border-gray-600 p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {highCount}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Medium Priority
          </div>
        </div>
        <div className="text-center border border-gray-600 p-3">
          <div className="text-2xl font-bold text-green-400">
            {completedToday.length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Done
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading tasks...</div>
      ) : activeTodos.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No active tasks</div>
      ) : (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
            Active Tasks ({activeTodos.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeTodos.slice(0, 10).map(todo => (
              <div key={todo.id} className="border border-gray-600 p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-bold">
                      {todo.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {todo.project.name}
                    </div>
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(todo.priority)}`}>
                    {getPriorityLabel(todo.priority)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="border-t border-white pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
            Completed ({completedToday.length})
          </h3>
          <div className="space-y-2">
            {completedToday.slice(0, 5).map(todo => (
              <div key={todo.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 line-through">{todo.title}</span>
                <span className="text-green-400 text-xs">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}