'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

type Props = {
  month: string // "yyyy-MM"
}

export default function MonthNavigator({ month }: Props) {
  const router = useRouter()
  const current = parseISO(month + '-01')

  const go = (date: Date) => {
    router.push(`/calendar?month=${format(date, 'yyyy-MM')}`)
  }

  const isCurrentMonth = month === format(new Date(), 'yyyy-MM')

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => go(subMonths(current, 1))}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-bold text-gray-900 min-w-28 text-center">
        {format(current, 'yyyy年M月', { locale: ja })}
      </span>
      <button
        onClick={() => go(addMonths(current, 1))}
        disabled={isCurrentMonth}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
