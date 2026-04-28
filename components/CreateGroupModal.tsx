'use client'

import { useActionState } from 'react'
import { createGroup } from '@/app/actions/groups'
import { Plus, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function CreateGroupModal() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submitted = useRef(false)
  const [state, action, pending] = useActionState(createGroup, null)

  useEffect(() => {
    if (submitted.current && state === null && !pending) {
      setOpen(false)
      formRef.current?.reset()
      submitted.current = false
    }
  }, [state, pending])

  const handleAction = (formData: FormData) => {
    submitted.current = true
    action(formData)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        作成
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">グループを作成</h2>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} action={handleAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">グループ名</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="例：朝活メンバー"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                <input
                  name="description"
                  type="text"
                  placeholder="グループの説明"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {state?.error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                {pending ? '作成中...' : 'グループを作成'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
