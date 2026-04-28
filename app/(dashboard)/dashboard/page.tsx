import { createClient } from '@/lib/supabase-server'
import { signOut } from '@/app/actions/auth'
import { CheckCircle, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import HabitCard from '@/components/HabitCard'
import AddHabitModal from '@/components/AddHabitModal'
import BottomNav from '@/components/BottomNav'

function calcStreak(logs: { logged_at: string }[]): number {
  if (logs.length === 0) return 0
  const dates = logs.map((l) => l.logged_at).sort().reverse()
  const today = format(new Date(), 'yyyy-MM-dd')
  let streak = 0
  let current = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = format(current, 'yyyy-MM-dd')
    if (dates.includes(dateStr)) {
      streak++
      current.setDate(current.getDate() - 1)
    } else if (dateStr === today) {
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLabel = format(new Date(), 'M月d日（E）', { locale: ja })

  const [{ data: profile }, { data: habits }] = await Promise.all([
    supabase.from('profiles').select('username').eq('id', user!.id).single(),
    supabase.from('habits').select('id, title, icon, color').eq('user_id', user!.id).order('created_at'),
  ])

  // 今日のログと全ログを一括取得
  const habitIds = habits?.map((h) => h.id) ?? []
  const { data: todayLogs } = habitIds.length
    ? await supabase.from('habit_logs').select('habit_id').eq('user_id', user!.id).eq('logged_at', today).in('habit_id', habitIds)
    : { data: [] }
  const { data: allLogs } = habitIds.length
    ? await supabase.from('habit_logs').select('habit_id, logged_at').eq('user_id', user!.id).in('habit_id', habitIds)
    : { data: [] }

  const doneSet = new Set(todayLogs?.map((l) => l.habit_id) ?? [])
  const doneCount = doneSet.size
  const totalCount = habits?.length ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">HabitLoop</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {profile?.username ?? 'ユーザー'}さん
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 今日の進捗サマリー */}
        {totalCount > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 font-medium">{todayLabel}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {doneCount === totalCount
                    ? '全部完了！ 今日も最高です 🎉'
                    : `あと ${totalCount - doneCount} 個`}
                </p>
              </div>
              <span className="text-3xl font-bold text-indigo-600">
                {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* 習慣リスト */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">今日の習慣</h2>
            <AddHabitModal />
          </div>

          {!habits || habits.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-gray-500 font-medium">まだ習慣がありません</p>
              <p className="text-gray-400 text-sm mt-1">
                「追加」ボタンから最初の習慣を作りましょう！
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const logs = allLogs?.filter((l) => l.habit_id === habit.id) ?? []
                const streak = calcStreak(logs)
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    streak={streak}
                    isDone={doneSet.has(habit.id)}
                    today={today}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
