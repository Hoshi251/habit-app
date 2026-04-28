'use client'

import { useState, useRef } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { updateCharacterName } from '@/app/actions/character'

export default function CharacterNameEditor({ initialName }: { initialName: string }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setEditing(true)
    setError('')
    setTimeout(() => inputRef.current?.select(), 50)
  }

  const cancel = () => {
    setEditing(false)
    setName(initialName)
    setError('')
  }

  const save = async () => {
    setSaving(true)
    const result = await updateCharacterName(name)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setEditing(false)
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
            className="text-xl font-bold text-center text-gray-900 border-b-2 border-indigo-400 bg-transparent focus:outline-none w-36"
            autoFocus
          />
          <button
            onClick={save}
            disabled={saving}
            className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={cancel}
            disabled={saving}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1.5 text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
    >
      {name}
      <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
    </button>
  )
}
