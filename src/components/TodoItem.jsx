
import { Trash2, Check, Square, CheckSquare } from 'lucide-react'

export function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <div className={`flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm group hover:shadow-md transition-all duration-200 ${todo.completed ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50/30' : 'border-gray-100 dark:border-gray-700'
            }`}>
            <button
                onClick={() => onToggle(todo.id)}
                className="mt-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
            >
                {todo.completed ? (
                    <CheckSquare className="w-6 h-6 text-blue-500" />
                ) : (
                    <Square className="w-6 h-6" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`text-lg font-medium truncate ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                    {todo.text}
                </p>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    {todo.completed && todo.completedBy && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                            Done by {todo.completedBy}
                        </span>
                    )}
                    {!todo.completed && todo.createdBy && (
                        <span>Added by {todo.createdBy}</span>
                    )}
                </div>
            </div>

            <button
                onClick={() => onDelete(todo.id)}
                className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                aria-label="Delete task"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    )
}
