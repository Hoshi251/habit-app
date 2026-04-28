import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { applyDecay, determineCharacterType, getCharacterStage } from '@/lib/character'
import type { CharacterStats } from '@/lib/types'
import CharacterStatsBar from '@/components/CharacterStats'
import CharacterImage from '@/components/CharacterImage'
import CharacterBubble from '@/components/CharacterBubble'
import CharacterNameEditor from '@/components/CharacterNameEditor'
import BottomNav from '@/components/BottomNav'

const PARAM_LABELS: Record<string, string> = {
  energy: '体力', focus: '知性', calm: '精神力', recovery: '健康', social: '社交性',
}

export default async function CharacterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: rawStats } = await supabase
    .from('character_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let stats: CharacterStats
  if (!rawStats) {
    const { data: inserted } = await supabase
      .from('character_stats')
      .insert({ user_id: user.id })
      .select()
      .single()
    stats = inserted ? {
      user_id: inserted.user_id,
      energy: Number(inserted.energy),
      focus: Number(inserted.focus),
      calm: Number(inserted.calm),
      recovery: Number(inserted.recovery),
      social: Number(inserted.social),
      warmth: Number(inserted.warmth),
      last_updated: inserted.last_updated,
    } : {
      user_id: user.id,
      energy: 0, focus: 0, calm: 0, recovery: 0, social: 0,
      warmth: 50, last_updated: today,
    }
  } else {
    stats = {
      user_id: rawStats.user_id,
      energy: Number(rawStats.energy),
      focus: Number(rawStats.focus),
      calm: Number(rawStats.calm),
      recovery: Number(rawStats.recovery),
      social: Number(rawStats.social),
      warmth: Number(rawStats.warmth),
      last_updated: rawStats.last_updated,
    }
  }

  // 減衰を適用してDBを更新
  const decayed = applyDecay(stats, today)
  if (decayed.last_updated !== stats.last_updated) {
    await supabase.from('character_stats').update({
      energy: decayed.energy,
      focus: decayed.focus,
      calm: decayed.calm,
      recovery: decayed.recovery,
      social: decayed.social,
      warmth: decayed.warmth,
      last_updated: decayed.last_updated,
    }).eq('user_id', user.id)
  }

  const characterName: string = rawStats?.character_name ?? 'ルナ'
  const characterType = determineCharacterType(decayed)
  const stage = getCharacterStage(decayed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">キャラクター</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* キャラクター表示エリア */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3">
          <CharacterBubble />
          <CharacterImage stage={stage} />
          <CharacterNameEditor initialName={characterName} />

          {characterType ? (
            <p className="text-xs text-gray-400">
              {PARAM_LABELS[characterType.main]} メイン
              {' / '}
              {PARAM_LABELS[characterType.sub]} サブ
            </p>
          ) : (
            <p className="text-sm text-gray-400">習慣をチェックしてキャラクターを育てよう！</p>
          )}
        </div>

        {/* パラメーターバー */}
        <CharacterStatsBar stats={decayed} />
      </main>

      <BottomNav />
    </div>
  )
}

