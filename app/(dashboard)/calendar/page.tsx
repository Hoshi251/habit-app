import { createClient } from '@/lib/supabase-server'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import MonthNavigator from '@/components/MonthNavigator'
import CalendarGrid from '@/components/CalendarGrid'
import BottomNav from '@/components/BottomNav'

type Props = {
  searchParams: Promise<{ month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const { month: monthParam } = await searchParams
  const month = monthParam ?? format(new Date(), 'yyyy-MM')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const monthStart = format(startOfMonth(parseISO(month + '-01')), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(parseISO(month + '-01')), 'yyyy-MM-dd')

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase
      .from('habits')
      .select('id, title, icon, color')
      .eq('user_id', user!.id)
      .order('created_at'),
    supabase
      .from('habit_logs')
      .select('habit_id, logged_at')
      .eq('user_id', user!.id)
      .gte('logged_at', monthStart)
      .lte('logged_at', monthEnd),
  ])

  // 月の統計
  const totalDays = endOfMonth(parseISO(month + '-01')).getDate()
  const today = new Date()
  const passedDays = month === format(today, 'yyyy-MM')
    ? today.getDate()
    : totalDays

  const logsByDate = new Map<string, number>()
  for (const log of logs ?? []) {
    logsByDate.set(log.logged_at, (logsByDate.get(log.logged_at) ?? 0) + 1)
  }
  const totalHabits = habits?.length ?? 0
  const perfectDays = totalHabits > 0
    ? [...logsByDate.entries()].filter(([, count]) => count === totalHabits).length
    : 0
  const activeDays = logsByDate.size

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">カレンダー</h1>
          <MonthNavigator month={month} />
        </div>

        {/* 月間サマリー */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">{perfectDays}</p>
            <p className="text-xs text-gray-400 mt-1">全完了日</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-400">{activeDays}</p>
            <p className="text-xs text-gray-400 mt-1">実施日</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-700">
              {passedDays > 0 ? Math.round((activeDays / passedDays) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">継続率</p>
          </div>
        </div>

        {/* カレンダー本体 */}
        <CalendarGrid
          month={month}
          habits={habits ?? []}
          logs={logs ?? []}
        />
      </main>

      <BottomNav />
    </div>
  )
}
