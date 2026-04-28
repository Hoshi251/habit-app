import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Flame, Trophy, TrendingUp, CalendarCheck } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import WeeklyBarChart from '@/components/WeeklyBarChart'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function calcStreak(logDates: string[], today: string): { current: number; best: number } {
  const sorted = [...new Set(logDates)].sort().reverse()
  let current = 0
  let best = 0
  let streak = 0
  let prev: Date | null = null

  for (const d of sorted) {
    const date = new Date(d)
    if (!prev) {
      if (d === today || d === format(subDays(new Date(today), 0), 'yyyy-MM-dd')) {
        streak = 1
      } else {
        streak = 0
      }
    } else {
      const diff = (prev.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        streak++
      } else {
        best = Math.max(best, streak)
        streak = 1
      }
    }
    prev = date
  }
  best = Math.max(best, streak)

  // 今日か昨日を含む連続がcurrent
  const todayDate = new Date(today)
  let cur = 0
  let d = new Date(today)
  while (true) {
    const ds = format(d, 'yyyy-MM-dd')
    if (logDates.includes(ds)) {
      cur++
      d = subDays(d, 1)
    } else if (cur === 0 && ds !== today) {
      break
    } else {
      break
    }
  }
  current = cur

  return { current, best }
}

export default async function StatsPage() {
  const [user, supabase] = await Promise.all([getAuthUser(), createClient()])
  const today = format(new Date(), 'yyyy-MM-dd')

  // 過去30日のログを取得
  const from30 = format(subDays(new Date(), 29), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from('habits').select('id, title, icon, color').eq('user_id', user!.id).order('created_at'),
    supabase.from('habit_logs').select('habit_id, logged_at').eq('user_id', user!.id).gte('logged_at', from30),
  ])

  const habitList = habits ?? []
  const logList = logs ?? []
  const totalHabits = habitList.length

  // 週間バーチャート用データ（過去7日）
  const last7 = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
  const weekData = last7.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayLogs = logList.filter((l) => l.logged_at === dateStr)
    const rate = totalHabits > 0 ? Math.round((dayLogs.length / totalHabits) * 100) : 0
    return {
      label: WEEKDAY_LABELS[getDay(day)],
      date: format(day, 'M/d'),
      rate,
      isToday: dateStr === today,
    }
  })

  // 今週の平均達成率
  const weekAvg = weekData.length > 0
    ? Math.round(weekData.reduce((sum, d) => sum + d.rate, 0) / weekData.length)
    : 0

  // 今月の統計
  const monthLogs = logList.filter((l) => l.logged_at >= monthStart && l.logged_at <= monthEnd)
  const today_d = new Date()
  const passedDays = today_d.getDate()
  const logsByDate = new Map<string, number>()
  for (const l of monthLogs) {
    logsByDate.set(l.logged_at, (logsByDate.get(l.logged_at) ?? 0) + 1)
  }
  const perfectDays = totalHabits > 0
    ? [...logsByDate.values()].filter((c) => c >= totalHabits).length
    : 0
  const activeDays = logsByDate.size
  const monthRate = passedDays > 0 ? Math.round((activeDays / passedDays) * 100) : 0

  // 習慣ごとの統計
  const habitStats = habitList.map((habit) => {
    const habitLogs = logList.filter((l) => l.habit_id === habit.id)
    const logDates = habitLogs.map((l) => l.logged_at)
    const { current, best } = calcStreak(logDates, today)
    const last30Count = habitLogs.length
    const rate30 = Math.round((last30Count / 30) * 100)
    return { ...habit, current, best, last30Count, rate30 }
  }).sort((a, b) => b.rate30 - a.rate30)

  // 全体のベストストリーク習慣
  const bestHabit = habitStats.reduce(
    (best, h) => h.best > (best?.best ?? 0) ? h : best,
    null as typeof habitStats[0] | null
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">レポート</h1>

        {totalHabits === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <TrendingUp className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">まだ習慣がありません</p>
            <p className="text-gray-400 text-sm mt-1">習慣を追加するとレポートが表示されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 今月のサマリーカード */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <CalendarCheck className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-indigo-600">{perfectDays}</p>
                <p className="text-xs text-gray-400 mt-0.5">全完了日</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-400">{monthRate}%</p>
                <p className="text-xs text-gray-400 mt-0.5">今月の継続率</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-500">{bestHabit?.best ?? 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">最長ストリーク</p>
              </div>
            </div>

            {/* 週間バーチャート */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">過去7日の達成率</h2>
                <span className="text-sm font-bold text-indigo-600">平均 {weekAvg}%</span>
              </div>
              <WeeklyBarChart data={weekData} />
              {/* 凡例 */}
              <div className="flex items-center gap-4 mt-3 justify-center">
                {[
                  { color: '#22c55e', label: '100%' },
                  { color: '#6366f1', label: '50%〜' },
                  { color: '#a5b4fc', label: '1〜49%' },
                  { color: '#e5e7eb', label: '0%' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 習慣ごとの統計 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4">習慣ごとの達成状況</h2>
              <div className="space-y-4">
                {habitStats.map((habit) => (
                  <div key={habit.id}>
                    {/* 習慣名 */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-36">
                          {habit.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {habit.current > 0 && (
                          <div className="flex items-center gap-0.5 text-orange-400">
                            <Flame className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{habit.current}日</span>
                          </div>
                        )}
                        <span className="text-sm font-bold" style={{ color: habit.color }}>
                          {habit.rate30}%
                        </span>
                      </div>
                    </div>
                    {/* 30日達成率バー */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${habit.rate30}%`, backgroundColor: habit.color }}
                      />
                    </div>
                    {/* サブ情報 */}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">過去30日: {habit.last30Count}回達成</span>
                      {habit.best > 0 && (
                        <span className="text-xs text-gray-400">最長 {habit.best}日連続</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
