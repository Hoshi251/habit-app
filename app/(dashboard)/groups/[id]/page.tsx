import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowLeft, Check, Users } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CopyInviteCode from '@/components/CopyInviteCode'
import HabitReaction from '@/components/HabitReaction'
import { leaveGroup } from '@/app/actions/groups'

type Props = {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLabel = format(new Date(), 'M月d日（E）', { locale: ja })

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, description, invite_code, created_by')
    .eq('id', id)
    .single()

  if (!group) notFound()

  const { data: myMembership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user!.id)
    .single()

  if (!myMembership) notFound()

  const { data: members } = await supabase
    .from('group_members')
    .select('role, user_id, profiles(username)')
    .eq('group_id', id)

  const memberIds = members?.map((m) => m.user_id) ?? []

  const { data: allHabits } = await supabase
    .from('habits')
    .select('id, user_id, title, icon, color')
    .in('user_id', memberIds)

  // habit_log の id も取得してリアクションと紐付ける
  const { data: todayLogs } = memberIds.length
    ? await supabase
        .from('habit_logs')
        .select('id, habit_id, user_id')
        .in('user_id', memberIds)
        .eq('logged_at', today)
    : { data: [] }

  // 今日のログIDでリアクションを一括取得
  const logIds = todayLogs?.map((l) => l.id) ?? []
  const { data: allReactions } = logIds.length
    ? await supabase
        .from('reactions')
        .select('habit_log_id, user_id, emoji')
        .in('habit_log_id', logIds)
    : { data: [] }

  // habit_id → log_id のマップ
  const logByHabitId = new Map(todayLogs?.map((l) => [l.habit_id, l.id]) ?? [])

  // log_id ごとのリアクションをまとめる
  const reactionsByLogId = new Map<string, { emoji: string; userIds: string[] }[]>()
  for (const r of allReactions ?? []) {
    if (!reactionsByLogId.has(r.habit_log_id)) reactionsByLogId.set(r.habit_log_id, [])
    const group = reactionsByLogId.get(r.habit_log_id)!
    const existing = group.find((g) => g.emoji === r.emoji)
    if (existing) {
      existing.userIds.push(r.user_id)
    } else {
      group.push({ emoji: r.emoji, userIds: [r.user_id] })
    }
  }

  const memberProgress = members?.map((m) => {
    const profile = m.profiles as unknown as { username: string } | null
    const habits = allHabits?.filter((h) => h.user_id === m.user_id) ?? []
    const doneLogs = todayLogs?.filter((l) => l.user_id === m.user_id) ?? []
    const doneSet = new Set(doneLogs.map((l) => l.habit_id))
    const doneCount = habits.filter((h) => doneSet.has(h.id)).length
    const totalCount = habits.length
    const rate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

    return {
      user_id: m.user_id,
      username: profile?.username ?? 'ユーザー',
      role: m.role,
      isMe: m.user_id === user!.id,
      habits,
      doneCount,
      totalCount,
      rate,
      doneSet,
    }
  }) ?? []

  memberProgress.sort((a, b) => {
    if (a.isMe) return -1
    if (b.isMe) return 1
    return b.rate - a.rate
  })

  const isOwner = myMembership.role === 'owner'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/groups" className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-gray-400 truncate">{group.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{members?.length ?? 0}人</span>
          </div>
        </div>

        {isOwner && (
          <div className="mb-4">
            <CopyInviteCode code={group.invite_code} />
          </div>
        )}

        {/* 今日の進捗 */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">{todayLabel}の進捗</h2>
          <div className="space-y-3">
            {memberProgress.map((member) => (
              <div key={member.user_id} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* メンバーヘッダー */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      member.isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.username.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 text-sm">
                        {member.username}
                        {member.isMe && <span className="text-indigo-400 ml-1">（自分）</span>}
                      </span>
                      {member.role === 'owner' && (
                        <span className="ml-1.5 text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">
                          オーナー
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${
                    member.rate === 100 ? 'text-green-500' :
                    member.rate >= 50 ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    {member.totalCount > 0 ? `${member.rate}%` : '—'}
                  </span>
                </div>

                {member.totalCount > 0 && (
                  <>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${member.rate}%`,
                          backgroundColor: member.rate === 100 ? '#22c55e' : '#6366f1',
                        }}
                      />
                    </div>

                    {/* 習慣リスト＋リアクション */}
                    <div className="space-y-2">
                      {member.habits.map((habit) => {
                        const done = member.doneSet.has(habit.id)
                        const logId = logByHabitId.get(habit.id)
                        const rawReactions = logId ? (reactionsByLogId.get(logId) ?? []) : []
                        const reactionSummary = rawReactions.map((r) => ({
                          emoji: r.emoji,
                          count: r.userIds.length,
                          mine: r.userIds.includes(user!.id),
                        }))

                        return (
                          <div key={habit.id}>
                            {/* 習慣タグ */}
                            <div
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl ${
                                done ? 'text-white' : 'bg-gray-50 text-gray-500'
                              }`}
                              style={done ? { backgroundColor: habit.color } : {}}
                            >
                              {done
                                ? <Check className="w-3 h-3" strokeWidth={3} />
                                : <span>{habit.icon}</span>
                              }
                              <span className={done ? 'line-through opacity-80' : ''}>{habit.title}</span>
                            </div>

                            {/* 完了済みのみリアクション表示 */}
                            {done && logId && (
                              <HabitReaction
                                logId={logId}
                                groupId={id}
                                reactions={reactionSummary}
                                isMe={member.isMe}
                              />
                            )}
                          </div>
                        )
                      })}
                      {member.habits.length === 0 && (
                        <p className="text-xs text-gray-400">習慣がまだありません</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {!isOwner && (
          <form action={leaveGroup.bind(null, id)}>
            <button
              type="submit"
              className="w-full text-red-400 hover:text-red-600 text-sm py-3 hover:bg-red-50 rounded-xl transition-colors"
              onClick={(e) => {
                if (!confirm(`「${group.name}」を退出しますか？`)) e.preventDefault()
              }}
            >
              グループを退出する
            </button>
          </form>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
