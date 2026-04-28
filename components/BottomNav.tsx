'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, CalendarDays, Users, BarChart2, Sparkles, HelpCircle } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: '今日', icon: CheckCircle },
  { href: '/calendar', label: 'カレンダー', icon: CalendarDays },
  { href: '/groups', label: 'グループ', icon: Users },
  { href: '/stats', label: 'レポート', icon: BarChart2 },
  { href: '/character', label: 'キャラ', icon: Sparkles },
  { href: '/help', label: 'ヘルプ', icon: HelpCircle },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
