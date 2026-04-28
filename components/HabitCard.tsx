'use client'

import { useTransition, useState } from 'react'
import { toggleHabitLog, deleteHabit } from '@/app/actions/habits'
import { Check, Flame, Trash2 } from 'lucide-react'

const REACTION_MESSAGES = [
  'いいね！', 'やったね！', 'その調子！', '継続中！',
  '素晴らしい！', '一歩前進！', 'できた！', 'ナイス！',
]

type Props = {
  habit: {
    id: string
    title: string
    icon: string
    color: string
  }
  streak: number
  isDone: boolean
  today: string
}

export default function HabitCard({ habit, streak, isDone, today }: Props) {
  const [isPending, startTransition] = useTransition()
  const [reaction, setReaction] = useState<string | null>(null)

  const handleToggle = () => {
    if (!isDone) {
      const msg = REACTION_MESSAGES[Math.floor(Math.random() * REACTION_MESSAGES.length)]
      setReaction(msg)
      setTimeout(() => setReaction(null), 2000)
    }
    startTransition(() => toggleHabitLog(habit.id, today, isDone))
  }

  const handleDelete = () => {
    if (!confirm(`「${habit.title}」を削除しますか？`)) return
    startTransition(() => deleteHabit(habit.id))
  }

  return (
    <div className="relative">
      {/* チェックイン反応吹き出し */}
      {reaction && (
        <div className="absolute -top-8 left-8 z-10 bg-white rounded-xl px-3 py-1.5 shadow-md text-sm font-medium text-indigo-600 animate-[fadeInUp_0.2s_ease-out]">
          {reaction}
          <div className="absolute -bottom-1.5 left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      )}
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all ${
        isPending ? 'opacity-60' : ''
      }`}
    >
      {/* チェックボタン */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          isDone
            ? 'text-white shadow-md scale-95'
            : 'border-2 border-gray-200 hover:border-opacity-60 hover:scale-105'
        }`}
        style={isDone ? { backgroundColor: habit.color } : { borderColor: habit.color + '80' }}
      >
        {isDone ? (
          <Check className="w-6 h-6" strokeWidth={3} />
        ) : (
          <span className="text-2xl">{habit.icon}</span>
        )}
      </button>

      {/* 習慣情報 */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            isDone ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {habit.title}
        </p>
        {streak > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">{streak}日連続</span>
          </div>
        )}
      </div>

      {/* アイコン表示（未完了時） */}
      {!isDone && (
        <span className="text-2xl flex-shrink-0">{habit.icon}</span>
      )}

      {/* 削除ボタン */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    </div>
  )
}
