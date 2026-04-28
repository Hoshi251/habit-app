'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { applyDecay, calcCheckinGain, calcWarmthDelta, applyDelta, getCharacterStage, serializeStage, getTypeDisplayName } from '@/lib/character'
import type { HabitCategory, CharacterStats } from '@/lib/types'
import { format } from 'date-fns'

export async function createHabit(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const title = (formData.get('title') as string)?.trim()
  const icon = (formData.get('icon') as string) || '✅'
  const color = (formData.get('color') as string) || '#6366f1'
  const category = (formData.get('category') as HabitCategory | '') || null

  if (!title) return { error: '習慣名を入力してください' }

  const { error } = await supabase.from('habits').insert({
    user_id: user.id,
    title,
    icon,
    color,
    frequency: 'daily',
    category: category || null,
  })

  if (error) return { error: '習慣の作成に失敗しました: ' + error.message }

  revalidatePath('/dashboard')
  return null
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('habits').delete().eq('id', habitId).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

export async function toggleHabitLog(habitId: string, today: string, isDone: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (isDone) {
    await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('logged_at', today)
  } else {
    await supabase.from('habit_logs').insert({
      habit_id: habitId,
      user_id: user.id,
      logged_at: today,
    })

    await updateCharacterStats(supabase, user.id, habitId, today)
  }

  revalidatePath('/dashboard')
  revalidatePath('/character')
}

async function updateCharacterStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  habitId: string,
  today: string,
) {
  const yesterday = format(new Date(today + 'T00:00:00'), 'yyyy-MM-dd')
  const dayBefore = format(new Date(new Date(today + 'T00:00:00').getTime() - 86400000 * 2), 'yyyy-MM-dd')

  const [
    { data: habit },
    { data: currentStats },
    { data: todayLogs },
    { data: allHabits },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('habits').select('category').eq('id', habitId).single(),
    supabase.from('character_stats').select('*').eq('user_id', userId).single(),
    supabase.from('habit_logs').select('habit_id').eq('user_id', userId).eq('logged_at', today),
    supabase.from('habits').select('id, category').eq('user_id', userId),
    supabase.from('habit_logs')
      .select('habit_id, logged_at')
      .eq('user_id', userId)
      .in('logged_at', [yesterday, dayBefore]),
  ])

  const category = habit?.category as HabitCategory | null

  const defaultStats: CharacterStats = {
    user_id: userId,
    energy: 0, focus: 0, calm: 0, recovery: 0, social: 0,
    warmth: 50,
    last_updated: today,
  }
  const stats: CharacterStats = currentStats ? {
    user_id: currentStats.user_id,
    energy: Number(currentStats.energy),
    focus: Number(currentStats.focus),
    calm: Number(currentStats.calm),
    recovery: Number(currentStats.recovery),
    social: Number(currentStats.social),
    warmth: Number(currentStats.warmth),
    last_updated: currentStats.last_updated,
  } : defaultStats

  // 減衰を先に適用
  const decayedStats = applyDecay(stats, today)

  // 今日すでに上昇したカテゴリーを収集（今回チェックしたhabitId以外）
  const checkedHabitIds = (todayLogs ?? [])
    .map((l: { habit_id: string }) => l.habit_id)
    .filter((id: string) => id !== habitId)
  const habitCategoryMap = new Map(
    (allHabits ?? []).map((h: { id: string; category: string | null }) => [h.id, h.category as HabitCategory | null])
  )
  const todayCheckedCategories: HabitCategory[] = checkedHabitIds
    .map((id: string) => habitCategoryMap.get(id))
    .filter((c): c is HabitCategory => !!c)

  // 同カテゴリー連続日数チェック
  let consecutiveDays = 1
  if (category) {
    const prevCategoryLogs = (recentLogs ?? []).filter((l: { habit_id: string; logged_at: string }) => {
      const cat = habitCategoryMap.get(l.habit_id)
      return cat === category
    })
    const hasYesterday = prevCategoryLogs.some((l: { logged_at: string }) => l.logged_at === yesterday)
    const hasDayBefore = prevCategoryLogs.some((l: { logged_at: string }) => l.logged_at === dayBefore)
    if (hasYesterday) consecutiveDays = 2
    if (hasYesterday && hasDayBefore) consecutiveDays = 3
  }

  const currentCatValue = category ? decayedStats[category] : 0
  const paramDelta = calcCheckinGain(currentCatValue, category, todayCheckedCategories, consecutiveDays)

  // warmth: チェック後の完了数で計算（今回分を含む）
  const doneCount = (todayLogs?.length ?? 0) + 1
  const totalCount = allHabits?.length ?? 0
  const warmthDelta = calcWarmthDelta(doneCount, totalCount)

  const newStats = applyDelta(decayedStats, { ...paramDelta, warmth: warmthDelta })

  // タイプ変化を検知
  const oldStage = getCharacterStage(decayedStats)
  const newStage = getCharacterStage(newStats)
  const oldKey = serializeStage(oldStage)
  const newKey = serializeStage(newStage)
  const typeChanged = oldKey !== newKey
  const newTypeName = getTypeDisplayName(newStage)

  await supabase.from('character_stats').upsert({
    user_id: userId,
    energy: newStats.energy,
    focus: newStats.focus,
    calm: newStats.calm,
    recovery: newStats.recovery,
    social: newStats.social,
    warmth: newStats.warmth,
    last_updated: today,
    ...(typeChanged && {
      current_type_key: newKey,
      current_type_name: newTypeName,
      type_updated_at: new Date().toISOString(),
    }),
  })
}
