
import { useState } from 'react'
import { Plus } from 'lucide-react'

export function CreateTodo({ onAdd }) {
    const [text, setText] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!text.trim()) return
        onAdd(text)
        setText('')
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new task..."
                className="w-full px-5 py-4 pr-12 text-lg bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
            />
            <button
                type="submit"
                disabled={!text.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
                aria-label="Add task"
            >
                <Plus className="w-5 h-5" />
            </button>
        </form>
    )
}
