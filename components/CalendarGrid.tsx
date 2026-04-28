'use client'

import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, parseISO, isToday, isFuture,
} from 'date-fns'
import { ja } from 'date-fns/locale'

type Habit = {
  id: string
  title: string
  icon: string
  color: string
}

type Props = {
  month: string // "yyyy-MM"
  habits: Habit[]
  logs: { habit_id: string; logged_at: string }[]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarGrid({ month, habits, logs }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), 'yyyy-MM-dd')
  )

  const monthStart = startOfMonth(parseISO(month + '-01'))
  const monthEnd = endOfMonth(monthStart)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 先頭の空白（日曜始まり）
  const startBlank = getDay(monthStart)

  // 日付ごとのログをマップ化
  const logMap = new Map<string, Set<string>>()
  for (const log of logs) {
    if (!logMap.has(log.logged_at)) logMap.set(log.logged_at, new Set())
    logMap.get(log.logged_at)!.add(log.habit_id)
  }

  const totalHabits = habits.length

  const selectedLogs = selectedDate ? (logMap.get(selectedDate) ?? new Set()) : new Set()

  return (
    <div className="space-y-4">
      {/* カレンダー */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {/* 先頭の空白 */}
          {Array.from({ length: startBlank }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const doneLogs = logMap.get(dateStr)
            const doneCount = doneLogs?.size ?? 0
            const rate = totalHabits > 0 ? doneCount / totalHabits : 0
            const future = isFuture(day) && !isToday(day)
            const isSelected = selectedDate === dateStr
            const dayOfWeek = getDay(day)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                disabled={future}
                className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : future
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* 日付数字 */}
                <span
                  className={`text-sm font-medium leading-none mb-1.5 ${
                    isToday(day)
                      ? 'text-indigo-600 font-bold'
                      : dayOfWeek === 0
                      ? 'text-red-400'
                      : dayOfWeek === 6
                      ? 'text-blue-400'
                      : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* 達成インジケーター */}
                {!future && totalHabits > 0 && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    {doneCount === 0 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    ) : rate === 1 ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: `conic-gradient(#6366f1 ${rate * 360}deg, #e5e7eb ${rate * 360}deg)`,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                          <span className="text-indigo-600" style={{ fontSize: '8px' }}>
                            {doneCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!future && totalHabits === 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-100" />
                )}
              </button>
            )
          })}
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-500">全完了</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
              <span className="text-indigo-600 font-bold" style={{ fontSize: '7px' }}>n</span>
            </div>
            <span className="text-xs text-gray-500">一部完了</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-500">未達成</span>
          </div>
        </div>
      </div>

      {/* 選択日の詳細 */}
      {selectedDate && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">
            {format(parseISO(selectedDate), 'M月d日（E）', { locale: ja })}の記録
          </h3>
          {habits.length === 0 ? (
            <p className="text-gray-400 text-sm">習慣がまだありません</p>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const done = selectedLogs.has(habit.id)
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-all ${
                        done ? 'text-white' : 'bg-gray-100'
                      }`}
                      style={done ? { backgroundColor: habit.color } : {}}
                    >
                      {done ? '✓' : habit.icon}
                    </div>
                    <span
                      className={`text-sm flex-1 ${
                        done ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className={`text-xs font-medium ${done ? 'text-indigo-500' : 'text-gray-300'}`}>
                      {done ? '完了' : '未達成'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
