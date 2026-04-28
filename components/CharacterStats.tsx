'use client'

import type { CharacterStats } from '@/lib/types'

const PARAM_CONFIG = [
  { key: 'energy'   as const, label: '体力',   icon: '⚡', color: '#ef4444' },
  { key: 'focus'    as const, label: '知性',   icon: '🔮', color: '#6366f1' },
  { key: 'calm'     as const, label: '精神力', icon: '🌙', color: '#14b8a6' },
  { key: 'recovery' as const, label: '健康',   icon: '💚', color: '#22c55e' },
  { key: 'social'   as const, label: '社交性', icon: '🌟', color: '#f97316' },
  { key: 'warmth'   as const, label: '優しさ', icon: '💕', color: '#ec4899' },
]

export default function CharacterStatsBar({ stats }: { stats: CharacterStats }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="font-bold text-gray-900 text-sm">パラメーター</h2>
      {PARAM_CONFIG.map(({ key, label, icon, color }) => {
        const value = Math.round(stats[key])
        const barWidth = Math.min(100, value)
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">{icon} {label}</span>
              <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
