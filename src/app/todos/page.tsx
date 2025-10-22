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

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My TODOs</h1>
          <p className="text-gray-500">{todos.length} active tasks</p>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              All caught up! No active TODOs.
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors"
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
                    className="flex-shrink-0 w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center hover:border-black transition-colors mt-0.5"
                  >
                    {todo.status === 'done' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: todo.project.color }}
                        />
                        <h3
                          className={`text-lg font-medium ${
                            todo.status === 'done' ? 'line-through text-gray-400' : 'text-black'
                          }`}
                        >
                          {todo.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{todo.project.name}</span>
                        {todo.priority === 1 && <span className="text-red-500">● High Priority</span>}
                        {todo.due && (
                          <span>
                            Due: {new Date(todo.due).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedId === todo.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {todo.notes && (
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              Notes
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {todo.notes}
                            </div>
                          </div>
                        )}
                        {todo.tags && (
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              Tags
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {todo.tags.split(',').map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-gray-100 rounded"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          Created: {new Date(todo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  <button
                    onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-black transition-colors"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        expandedId === todo.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
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
