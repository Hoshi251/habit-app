'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function CharacterBubble() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  const fetchMessage = async () => {
    setLoading(true)
    setVisible(false)
    try {
      const res = await fetch('/api/character-message')
      const data = await res.json()
      setMessage(data.message ?? '')
    } catch {
      setMessage('うまく話せなかったみたい…')
    } finally {
      setLoading(false)
      setTimeout(() => setVisible(true), 50)
    }
  }

  useEffect(() => {
    fetchMessage()
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative bg-white rounded-2xl px-4 py-2.5 shadow-md text-sm text-gray-700 max-w-56 text-center transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}
      >
        {loading ? (
          <span className="text-gray-400">・・・</span>
        ) : (
          message
        )}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[8px] border-r-[8px] border-t-[8px]
          border-l-transparent border-r-transparent border-t-white" />
      </div>

      <button
        onClick={fetchMessage}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-40 mt-1"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        もう一言
      </button>
    </div>
  )
}
