'use client'

import { useEffect, useState } from 'react'

interface Todo {
  id: string
  title: string
  notes: string
  priority: number
  status: string
  due: string | null
  tags: string
  project: {
    name: string
    color: string
  }
  createdAt: string
}

type SortOption = 'priority' | 'project' | 'due' | 'created'
type StatusFilter = 'all' | 'open' | 'doing' | 'blocked' | 'snoozed'

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const loadTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/todos')
      const data = await response.json()

      if (data.success) {
        setTodos(data.data.todos || [])
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async (todoId: string) => {
    try {
      await fetch(`/api/todos/${todoId}/complete`, { method: 'POST' })
      await loadTodos()
    } catch (error) {
      console.error('Failed to mark complete:', error)
    }
  }

  const markIncomplete = async (todoId: string) => {
    try {
      await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'open' })
      })
      await loadTodos()
    } catch (error) {
      console.error('Failed to mark incomplete:', error)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  // Filter and sort todos
  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (statusFilter === 'all') return true
      return todo.status === statusFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          // High priority (1) first, then normal (0)
          if (a.priority !== b.priority) return b.priority - a.priority
          // Secondary sort by created date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

        case 'project':
          // Alphabetical by project name
          const projectCompare = a.project.name.localeCompare(b.project.name)
          if (projectCompare !== 0) return projectCompare
          // Secondary sort by priority
          return b.priority - a.priority

        case 'due':
          // Tasks with due dates first, then by due date (soonest first)
          if (!a.due && !b.due) return 0
          if (!a.due) return 1
          if (!b.due) return -1
          return new Date(a.due).getTime() - new Date(b.due).getTime()

        case 'created':
          // Newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-[family-name:var(--font-geist-mono)]">
        <div className="text-xl uppercase tracking-wider">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-geist-mono)]">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-white">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">Active Tasks</h1>
          <p className="text-sm tracking-wide text-gray-400">
            {filteredAndSortedTodos.length} {statusFilter === 'all' ? 'TASKS' : statusFilter.toUpperCase()}
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 pb-6 border-b border-white">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            {/* Sort By */}
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Sort By</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'priority' as SortOption, label: 'Priority' },
                  { value: 'project' as SortOption, label: 'Project' },
                  { value: 'due' as SortOption, label: 'Due Date' },
                  { value: 'created' as SortOption, label: 'Created' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-4 py-2 border border-white uppercase text-xs tracking-wider transition-colors ${
                      sortBy === option.value
                        ? 'bg-white text-black'
                        : 'hover:bg-white hover:text-black'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter By Status */}
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Filter By Status</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all' as StatusFilter, label: 'All' },
                  { value: 'open' as StatusFilter, label: 'Open' },
                  { value: 'doing' as StatusFilter, label: 'Doing' },
                  { value: 'blocked' as StatusFilter, label: 'Blocked' },
                  { value: 'snoozed' as StatusFilter, label: 'Snoozed' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-4 py-2 border border-white uppercase text-xs tracking-wider transition-colors ${
                      statusFilter === option.value
                        ? 'bg-white text-black'
                        : 'hover:bg-white hover:text-black'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-20 text-gray-400 uppercase tracking-wider">
              {statusFilter === 'all'
                ? 'All caught up. No active tasks.'
                : `No tasks with status: ${statusFilter}`}
            </div>
          ) : (
            filteredAndSortedTodos.map((todo) => (
              <div
                key={todo.id}
                className="border border-white overflow-hidden hover:bg-white hover:text-black transition-colors group"
              >
                {/* Main Row */}
                <div className="flex items-start gap-4 p-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => {
                      if (todo.status === 'done') {
                        markIncomplete(todo.id)
                      } else {
                        markComplete(todo.id)
                      }
                    }}
                    className="flex-shrink-0 w-11 h-11 border-2 border-white flex items-center justify-center hover:bg-black hover:text-white group-hover:border-black transition-colors"
                    aria-label={todo.status === 'done' ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {todo.status === 'done' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                      className="w-full text-left min-h-[44px] flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-3 h-3 flex-shrink-0"
                          style={{ backgroundColor: todo.project.color }}
                        />
                        <h3
                          className={`text-lg font-bold uppercase tracking-wide ${
                            todo.status === 'done' ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {todo.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs uppercase tracking-wider opacity-70">
                        <span>{todo.project.name}</span>
                        {todo.priority === 1 && <span>High Priority</span>}
                        {todo.due && (
                          <span>
                            Due: {new Date(todo.due).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedId === todo.id && (
                      <div className="mt-4 pt-4 border-t border-current">
                        {todo.notes && (
                          <div className="mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">
                              Notes
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {todo.notes}
                            </div>
                          </div>
                        )}
                        {todo.tags && (
                          <div className="mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">
                              Tags
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {todo.tags.split(',').map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-3 py-1 border border-current uppercase tracking-wider"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs uppercase tracking-wider opacity-50">
                          Created: {new Date(todo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  <button
                    onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                    className="flex-shrink-0 w-11 h-11 flex items-center justify-center transition-transform"
                    aria-label={expandedId === todo.id ? 'Collapse' : 'Expand'}
                  >
                    <svg
                      className={`w-6 h-6 transition-transform ${
                        expandedId === todo.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
