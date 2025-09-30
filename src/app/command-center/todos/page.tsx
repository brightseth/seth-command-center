'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Todo {
  id: string
  title: string
  notes?: string
  priority: number
  status: 'open' | 'doing' | 'blocked' | 'done' | 'snoozed'
  due?: string
  source: string
  tags: string
  energy: number
  createdAt: string
  updatedAt: string
  score?: number
  scoreBreakdown?: {
    priority: number
    deadline: number
    energy: number
    recency: number
  }
  project: {
    name: string
    color?: string
    type: string
  }
}

interface FocusWindow {
  type: 'deep' | 'normal'
  start: string
  end: string
  duration: number
  tasks: Todo[]
  description: string
}

interface ApiResponse {
  success: boolean
  data: {
    todos?: Todo[]
    projects?: Array<{ id: string; name: string; color?: string; type: string }>
    meta?: any
    top3?: Todo[]
    focusWindows?: FocusWindow[]
    stats?: any
  }
  error?: string
}

export default function TodosPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'sources'>('today')
  const [todos, setTodos] = useState<Todo[]>([])
  const [top3, setTop3] = useState<Todo[]>([])
  const [focusWindows, setFocusWindows] = useState<FocusWindow[]>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string; color?: string; type: string }>>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  // Quick add form state
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [quickAddProject, setQuickAddProject] = useState('')
  const [quickAddPriority, setQuickAddPriority] = useState(2)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load todos based on active tab
      const todosResponse = await fetch(`/api/todos?view=${activeTab === 'sources' ? 'all' : activeTab}`)
      const todosData: ApiResponse = await todosResponse.json()

      if (todosData.success && todosData.data.todos) {
        setTodos(todosData.data.todos)
        setProjects(todosData.data.projects || [])
      }

      // Load Top 3 and focus windows for today tab
      if (activeTab === 'today') {
        const top3Response = await fetch('/api/top3')
        const top3Data: ApiResponse = await top3Response.json()

        if (top3Data.success && top3Data.data.top3) {
          setTop3(top3Data.data.top3)
          setFocusWindows(top3Data.data.focusWindows || [])
          setStats(top3Data.data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTodoStatus = async (todoId: string, newStatus: 'open' | 'doing' | 'done') => {
    try {
      if (newStatus === 'done') {
        await fetch(`/api/todos/${todoId}/complete`, { method: 'POST' })
      } else {
        await fetch(`/api/todos/${todoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      }
      loadData() // Refresh data
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const createQuickTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickAddTitle.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickAddTitle,
          projectId: quickAddProject || projects[0]?.id,
          priority: quickAddPriority,
          source: 'manual'
        })
      })

      if (response.ok) {
        setQuickAddTitle('')
        setShowQuickAdd(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-400 border-red-400'
      case 2: return 'text-yellow-400 border-yellow-400'
      case 3: return 'text-green-400 border-green-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'HIGH'
      case 2: return 'MED'
      case 3: return 'LOW'
      default: return 'N/A'
    }
  }

  const getEnergyLabel = (energy: number) => {
    switch (energy) {
      case 1: return 'DEEP'
      case 2: return 'NORMAL'
      case 3: return 'LIGHT'
      default: return 'N/A'
    }
  }

  const formatTime = (isoString: string) => {
    return format(new Date(isoString), 'h:mm a')
  }

  return (
    <div className="min-h-screen bg-black text-white font-helvetica">
      {/* Header */}
      <header className="border-b border-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-wider">
              @Seth Todos
            </h1>
            <p className="text-gray-400 mt-2">
              Dynamic task system - agent-aware, Swiss-clean
            </p>
          </div>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide"
          >
            + Quick Add
          </button>
        </div>

        {/* Quick Add Form */}
        {showQuickAdd && (
          <form onSubmit={createQuickTodo} className="mt-6 border border-gray-600 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                placeholder="Task title..."
                className="md:col-span-2 bg-black border border-white p-2 focus:outline-none focus:border-gray-400"
                required
              />
              <select
                value={quickAddProject}
                onChange={(e) => setQuickAddProject(e.target.value)}
                className="bg-black border border-white p-2 focus:outline-none focus:border-gray-400"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              <select
                value={quickAddPriority}
                onChange={(e) => setQuickAddPriority(Number(e.target.value))}
                className="bg-black border border-white p-2 focus:outline-none focus:border-gray-400"
              >
                <option value={1}>HIGH</option>
                <option value={2}>MED</option>
                <option value={3}>LOW</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="border border-gray-500 px-4 py-2 hover:bg-gray-500 hover:text-black transition-colors font-bold uppercase tracking-wide"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-white">
        <div className="flex">
          {['today', 'week', 'sources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'today' | 'week' | 'sources')}
              className={`flex-1 p-4 font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'hover:bg-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-400">Loading @Seth todos...</div>
        </div>
      ) : (
        <div className="p-8">
          {/* Today Tab */}
          {activeTab === 'today' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top 3 Panel */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
                  Top 3 Today
                </h2>

                {top3.length > 0 ? (
                  <div className="space-y-4">
                    {top3.map((todo, index) => (
                      <div key={todo.id} className="border border-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 border ${getPriorityColor(todo.priority)}`}>
                              {getPriorityLabel(todo.priority)}
                            </span>
                            <span className="text-xs text-gray-400 font-bold">
                              {getEnergyLabel(todo.energy)}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold mb-2">{todo.title}</h3>

                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span
                            className="font-bold"
                            style={{ color: todo.project.color || '#ffffff' }}
                          >
                            {todo.project.name}
                          </span>
                          {todo.due && (
                            <span>Due: {format(new Date(todo.due), 'MMM dd')}</span>
                          )}
                        </div>

                        {todo.scoreBreakdown && (
                          <div className="text-xs text-gray-400 mb-3">
                            Score: {todo.score} (P:{todo.scoreBreakdown.priority} D:{todo.scoreBreakdown.deadline} E:{todo.scoreBreakdown.energy} R:{todo.scoreBreakdown.recency})
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleTodoStatus(todo.id, todo.status === 'doing' ? 'open' : 'doing')}
                            className={`flex-1 text-xs font-bold uppercase tracking-wide py-2 border transition-colors ${
                              todo.status === 'doing'
                                ? 'bg-yellow-500 text-black border-yellow-500'
                                : 'border-white hover:bg-white hover:text-black'
                            }`}
                          >
                            {todo.status === 'doing' ? 'Pause' : 'Start'}
                          </button>
                          <button
                            onClick={() => toggleTodoStatus(todo.id, 'done')}
                            className="flex-1 text-xs font-bold uppercase tracking-wide py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-12">
                    <p>No active tasks to rank</p>
                    <p className="text-sm mt-2">All caught up! 🎉</p>
                  </div>
                )}

                {/* Focus Windows */}
                {focusWindows.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-4">
                      Focus Windows
                    </h3>

                    <div className="space-y-4">
                      {focusWindows.map((window, index) => (
                        <div key={index} className="border border-gray-600 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold uppercase text-sm tracking-wide">
                              {window.type} Work
                            </span>
                            <span className="text-sm text-gray-400">
                              {window.duration}min
                            </span>
                          </div>

                          <div className="text-sm text-gray-400 mb-2">
                            {formatTime(window.start)} - {formatTime(window.end)}
                          </div>

                          <div className="text-xs text-gray-400 mb-3">
                            {window.description}
                          </div>

                          {window.tasks.length > 0 && (
                            <div className="space-y-1">
                              {window.tasks.map(task => (
                                <div key={task.id} className="text-sm">
                                  • {task.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Today's Tasks Panel */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
                  Today's Tasks
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {todos
                    .filter(todo => todo.status !== 'done')
                    .map((todo) => (
                    <div key={todo.id} className="border border-gray-600 p-4 hover:border-white transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 border ${getPriorityColor(todo.priority)}`}>
                          {getPriorityLabel(todo.priority)}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">
                          {getEnergyLabel(todo.energy)}
                        </span>
                      </div>

                      <h3 className="font-bold mb-2">{todo.title}</h3>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span
                          className="font-bold"
                          style={{ color: todo.project.color || '#ffffff' }}
                        >
                          {todo.project.name}
                        </span>
                        <span className="uppercase text-xs">
                          {todo.status}
                        </span>
                      </div>

                      {todo.due && (
                        <div className="text-xs text-gray-400 mb-3">
                          Due: {format(new Date(todo.due), 'MMM dd, yyyy')}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTodoStatus(todo.id, todo.status === 'doing' ? 'open' : 'doing')}
                          className={`flex-1 text-xs font-bold uppercase tracking-wide py-2 border transition-colors ${
                            todo.status === 'doing'
                              ? 'bg-yellow-500 text-black border-yellow-500'
                              : 'border-white hover:bg-white hover:text-black'
                          }`}
                        >
                          {todo.status === 'doing' ? 'Pause' : 'Start'}
                        </button>
                        <button
                          onClick={() => toggleTodoStatus(todo.id, 'done')}
                          className="flex-1 text-xs font-bold uppercase tracking-wide py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {todos.filter(todo => todo.status !== 'done').length === 0 && (
                  <div className="text-gray-400 text-center py-12">
                    <p>All tasks completed for today! 🎉</p>
                    <p className="text-sm mt-2">Use Quick Add to create more tasks</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Week Tab */}
          {activeTab === 'week' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                This Week's Overview
              </h2>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['open', 'doing', 'blocked', 'done'].map(status => (
                  <div key={status} className="border border-gray-600">
                    <div className="bg-gray-900 p-4 border-b border-gray-600">
                      <h3 className="font-bold uppercase tracking-wide text-sm">
                        {status}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {todos.filter(t => t.status === status).length} tasks
                      </span>
                    </div>

                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {todos
                        .filter(todo => todo.status === status)
                        .map(todo => (
                        <div key={todo.id} className="border border-gray-700 p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-1 py-0.5 border ${getPriorityColor(todo.priority)}`}>
                              {getPriorityLabel(todo.priority)}
                            </span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: todo.project.color || '#ffffff' }}
                            >
                              {todo.project.name}
                            </span>
                          </div>
                          <div className="font-bold mb-1">{todo.title}</div>
                          {todo.due && (
                            <div className="text-xs text-gray-400">
                              Due: {format(new Date(todo.due), 'MMM dd')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                Task Sources & Capture
              </h2>

              {/* Source Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['email', 'slash', 'calendar', 'api', 'manual'].map(source => {
                  const count = todos.filter(t => t.source === source).length
                  return (
                    <div key={source} className="border border-gray-600 p-4 text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm uppercase tracking-wide text-gray-400">{source}</div>
                    </div>
                  )
                })}
              </div>

              {/* Recent Tasks by Source */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-4">
                    Email Captured Tasks
                  </h3>
                  <div className="space-y-3">
                    {todos
                      .filter(t => t.source === 'email')
                      .slice(0, 10)
                      .map(todo => (
                      <div key={todo.id} className="border border-gray-600 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-1 py-0.5 border ${getPriorityColor(todo.priority)}`}>
                            {getPriorityLabel(todo.priority)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(todo.createdAt), 'MMM dd')}
                          </span>
                        </div>
                        <div className="font-bold">{todo.title}</div>
                        <div
                          className="text-sm mt-1"
                          style={{ color: todo.project.color || '#ffffff' }}
                        >
                          {todo.project.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wide mb-4">
                    Manual & Slash Tasks
                  </h3>
                  <div className="space-y-3">
                    {todos
                      .filter(t => ['manual', 'slash'].includes(t.source))
                      .slice(0, 10)
                      .map(todo => (
                      <div key={todo.id} className="border border-gray-600 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-1 py-0.5 border ${getPriorityColor(todo.priority)}`}>
                            {getPriorityLabel(todo.priority)}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">
                            {todo.source}
                          </span>
                        </div>
                        <div className="font-bold">{todo.title}</div>
                        <div
                          className="text-sm mt-1"
                          style={{ color: todo.project.color || '#ffffff' }}
                        >
                          {todo.project.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}