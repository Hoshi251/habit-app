'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-indigo-400 font-medium mb-1">招待コード</p>
        <p className="text-2xl font-bold text-indigo-600 tracking-widest font-mono">{code}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          copied
            ? 'bg-green-100 text-green-600'
            : 'bg-white text-indigo-600 hover:bg-indigo-100 shadow-sm'
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'コピー済み' : 'コピー'}
      </button>
    </div>
  )
}
