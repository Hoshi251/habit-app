'use client'

import { useActionState } from 'react'
import { joinGroup } from '@/app/actions/groups'
import { LogIn, X } from 'lucide-react'
import { useState, useRef } from 'react'

export default function JoinGroupModal() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(joinGroup, null)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
      >
        <LogIn className="w-4 h-4" />
        参加
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">グループに参加</h2>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} action={action} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">招待コード</label>
                <input
                  name="invite_code"
                  type="text"
                  required
                  placeholder="8文字のコードを入力"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tracking-widest"
                  maxLength={8}
                />
                <p className="text-xs text-gray-400 mt-1">グループオーナーから共有された招待コードを入力してください</p>
              </div>

              {state?.error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                {pending ? '参加中...' : 'グループに参加する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
