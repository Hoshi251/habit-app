'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { toggleReaction } from '@/app/actions/reactions'
import { SmilePlus } from 'lucide-react'

const EMOJI_OPTIONS = ['👍', '🔥', '💪', '❤️', '🎉', '✨']

type ReactionSummary = {
  emoji: string
  count: number
  mine: boolean
}

type Props = {
  logId: string
  groupId: string
  reactions: ReactionSummary[]
  isMe: boolean
}

export default function HabitReaction({ logId, groupId, reactions, isMe }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleToggle = (emoji: string) => {
    setPickerOpen(false)
    startTransition(() => toggleReaction(logId, emoji, groupId))
  }

  // 自分の習慣には応援できない
  if (isMe) {
    return reactions.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-2">
        {reactions.map((r) => (
          <span
            key={r.emoji}
            className="flex items-center gap-0.5 text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5"
          >
            {r.emoji}
            <span className="text-gray-500 font-medium">{r.count}</span>
          </span>
        ))}
      </div>
    ) : null
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {/* 既存のリアクション */}
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggle(r.emoji)}
          disabled={isPending}
          className={`flex items-center gap-0.5 text-xs rounded-full px-2 py-0.5 transition-all ${
            r.mine
              ? 'bg-indigo-100 border border-indigo-300 text-indigo-700 scale-105'
              : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200'
          }`}
        >
          {r.emoji}
          <span className="font-medium">{r.count}</span>
        </button>
      ))}

      {/* 追加ボタン */}
      <div ref={pickerRef} className="relative">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          disabled={isPending}
          className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
        >
          <SmilePlus className="w-3.5 h-3.5" />
        </button>

        {pickerOpen && (
          <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1 z-30">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleToggle(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-indigo-50 text-lg transition-all hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
