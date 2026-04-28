import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase-server'
import { buildSystemPrompt } from '@/lib/character'
import type { CharacterStats } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rawStats } = await supabase
    .from('character_stats').select('*').eq('user_id', user.id).single()

  const stats: CharacterStats = rawStats ? {
    user_id: rawStats.user_id,
    energy:   Number(rawStats.energy),
    focus:    Number(rawStats.focus),
    calm:     Number(rawStats.calm),
    recovery: Number(rawStats.recovery),
    social:   Number(rawStats.social),
    warmth:   Number(rawStats.warmth),
    last_updated: rawStats.last_updated,
  } : {
    user_id: user.id,
    energy: 0, focus: 0, calm: 0, recovery: 0, social: 0,
    warmth: 50,
    last_updated: new Date().toISOString().slice(0, 10),
  }

  // タイプ変化イベントの検知（24時間以内）
  const typeUpdatedAt = rawStats?.type_updated_at ? new Date(rawStats.type_updated_at) : null
  const isTypeEvent = typeUpdatedAt
    ? Date.now() - typeUpdatedAt.getTime() < 24 * 60 * 60 * 1000
    : false
  const newTypeName: string | null = isTypeEvent ? (rawStats?.current_type_name ?? null) : null

  const systemPrompt = buildSystemPrompt(stats)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const userPrompt = newTypeName
    ? `あなたは最近「${newTypeName}」というタイプに変化しました。この変化を自覚しているかのような一言を、自然なひとりごとや声かけとして日本語で短く（1〜2文）つぶやいてください。タイプ名を直接言う必要はありません。`
    : '今の自分の状態を踏まえて、ユーザーへの一言を日本語で短く（1〜2文）つぶやいてください。チャットの返答ではなく、自然な声かけやひとりごとのような言葉で。'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 100,
  })

  const message = completion.choices[0]?.message?.content ?? 'こんにちは！'
  return NextResponse.json({ message })
}
