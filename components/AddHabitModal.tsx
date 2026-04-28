'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createHabit } from '@/app/actions/habits'
import { Plus, X } from 'lucide-react'

import type { HabitCategory } from '@/lib/types'

const ICONS = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎸', '🍎', '😴', '🧹']
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
]

const CATEGORIES: { value: HabitCategory | ''; label: string; icon: string; color: string }[] = [
  { value: '',         label: 'なし',   icon: '➖', color: '#9ca3af' },
  { value: 'energy',   label: '体力',   icon: '⚡', color: '#ef4444' },
  { value: 'focus',    label: '知性',   icon: '🔮', color: '#6366f1' },
  { value: 'calm',     label: '精神力', icon: '🌙', color: '#14b8a6' },
  { value: 'recovery', label: '健康',   icon: '💚', color: '#22c55e' },
  { value: 'social',   label: '社交性', icon: '🌟', color: '#f97316' },
]

export default function AddHabitModal() {
  const [open, setOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('✅')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | ''>('')
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action, pending] = useActionState(createHabit, null)

  useEffect(() => {
    if (state === null && !pending && open) {
      // 成功時（stateがnullに戻った = revalidate後）はモーダルを閉じる
      // ただし初回はopenがfalseなので無視
    }
  }, [state, pending, open])

  const handleAction = async (formData: FormData) => {
    formData.set('icon', selectedIcon)
    formData.set('color', selectedColor)
    formData.set('category', selectedCategory)
    await action(formData)
    setOpen(false)
    formRef.current?.reset()
    setSelectedCategory('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        追加
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">新しい習慣を追加</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} action={handleAction} className="space-y-5">
              {/* 習慣名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  習慣名
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="例：毎日30分読書する"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* アイコン選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* カラー選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カラー
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* カテゴリー選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー <span className="text-xs text-gray-400 font-normal">（キャラクターのパラメーターに影響）</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(({ value, label, icon, color }) => (
                    <button
                      key={value || 'none'}
                      type="button"
                      onClick={() => setSelectedCategory(value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all border ${
                        selectedCategory === value
                          ? 'border-2'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-transparent'
                      }`}
                      style={selectedCategory === value ? {
                        backgroundColor: color + '18',
                        borderColor: color,
                        color,
                      } : {}}
                    >
                      <span>{icon}</span>
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* プレビュー */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: selectedColor + '20', border: `2px solid ${selectedColor}40` }}
                >
                  {selectedIcon}
                </div>
                <span className="text-sm text-gray-600">プレビュー</span>
              </div>

              {state?.error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                {pending ? '追加中...' : '習慣を追加する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
