import { useState, useEffect, useCallback } from 'react'
import { TodoItem } from './components/TodoItem'
import { CreateTodo } from './components/CreateTodo'
import { Share2, CheckCircle2, Cloud, User } from 'lucide-react'
import { supabase } from './lib/supabase'

function App() {
  const [todos, setTodos] = useState([])
  const [listId, setListId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userName, setUserName] = useState(() => localStorage.getItem('taskflow-username') || '')

  // Initialize: Check URL for listId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('listId')

    if (id) {
      setListId(id)
      fetchSharedList(id)
    } else {
      loadLocalList()
    }
  }, [])

  // Save username
  useEffect(() => {
    localStorage.setItem('taskflow-username', userName)
  }, [userName])

  // Subscribe to changes
  useEffect(() => {
    if (!listId || !supabase) return

    const channel = supabase
      .channel('realtime-list')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'lists',
        filter: `id=eq.${listId}`
      }, (payload) => {
        if (payload.new && payload.new.todos) {
          setTodos(payload.new.todos)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId])

  // Persist to Local Storage if local mode
  useEffect(() => {
    if (!listId && !loading) {
      localStorage.setItem('my-todos', JSON.stringify(todos))
    }
  }, [todos, listId, loading])

  const toggleTodo = (id) => {
    if (!userName.trim()) {
      const name = prompt("Please enter your name to complete tasks:")
      if (name) setUserName(name)
      else return
    }

    saveTodos(todos.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed
        return {
          ...t,
          completed: isCompleting,
          completedBy: isCompleting ? userName : null,
          completedAt: isCompleting ? new Date().toISOString() : null
        }
      }
      return t
    }))
  }

  const deleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id))
  }

  const loadLocalList = () => {
    try {
      const saved = localStorage.getItem('my-todos')
      if (saved) setTodos(JSON.parse(saved))
    } catch (e) {
      console.error('Failed to load todos', e)
    }
    setLoading(false)
  }

  const fetchSharedList = async (id) => {
    if (!supabase) {
      console.warn('Supabase not configured')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('lists')
      .select('todos')
      .eq('id', id)
      .single()

    if (data) {
      setTodos(data.todos || [])
    } else if (error) {
      console.error('Error fetching list:', error)
      // If list doesn't exist, maybe Create it? or show error?
      // For now, just show empty
    }
    setLoading(false)
  }

  const saveTodos = useCallback(async (newTodos) => {
    setTodos(newTodos)

    // If shared, sync to backend
    if (listId && supabase) {
      setIsSyncing(true)
      const { error } = await supabase
        .from('lists')
        .update({ todos: newTodos })
        .eq('id', listId)

      if (error) console.error('Error syncing:', error)
      setIsSyncing(false)
    }
  })

  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text, completed: false, createdBy: userName }
    saveTodos([newTodo, ...todos])
  }

  const handleShare = async () => {
    if (!supabase) {
      alert('Supabase keys missing! See SUPABASE_SETUP.md')
      return
    }

    if (listId) {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
      return
    }

    // Create new list
    const newId = crypto.randomUUID()
    setIsSyncing(true)

    const { error } = await supabase
      .from('lists')
      .insert({ id: newId, todos })

    setIsSyncing(false)

    if (error) {
      alert('Error creating shared list: ' + error.message)
      return
    }

    setListId(newId)
    const url = new URL(window.location)
    url.searchParams.set('listId', newId)
    window.history.pushState({}, '', url)

    await navigator.clipboard.writeText(url.toString())
    alert('List is now live! Link copied to clipboard.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TaskFlow</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Simple & Shared</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="group flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <Share2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            {listId ? 'Share Link' : 'Share List'}
          </button>
        </header>

        {/* User identification */}
        <div className="flex items-center gap-3 mb-6 bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Status Bar */}
        {listId && (
          <div className={`flex items-center justify-center gap-2 text-sm font-medium mb-6 py-2 px-4 rounded-full w-fit mx-auto transition-all ${isSyncing
              ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-green-100/50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }`}>
            {isSyncing ? <Cloud className="w-4 h-4 animate-pulse" /> : <Cloud className="w-4 h-4" />}
            <span>{isSyncing ? 'Syncing...' : 'Synced with Cloud'}</span>
          </div>
        )}

        {/* Input */}
        <div className="mb-8">
          <CreateTodo onAdd={addTodo} />
        </div>

        {/* List */}
        <div className="space-y-3 pb-20 flex-1">
          {todos.length === 0 ? (
            <div className="text-center py-20 px-6 opacity-60">
              <div className="inline-block p-6 rounded-3xl bg-white dark:bg-gray-800 shadow-sm mb-4">
                <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-300">All caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400">Add a new task to get started.</p>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-auto py-4">
          <p className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 inline-block">
            {listId ? 'Shared List Mode' : 'Local List Mode'}
          </p>
        </div>

      </div>
    </div>
  )
}

export default App
