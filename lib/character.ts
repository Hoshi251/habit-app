import type { CharacterStats, CharacterType, HabitCategory, ParameterKey } from './types'

const STAT_KEYS: HabitCategory[] = ['energy', 'focus', 'calm', 'recovery', 'social']

export const DECAY_RATES: Record<HabitCategory, number> = {
  energy:   2.0,
  focus:    0.5,
  calm:     1.0,
  recovery: 1.0,
  social:   2.0,
}

export const BASE_GAIN = 10
export const MAX_CATEGORIES_PER_DAY = 3

const CHARACTER_TYPES: Partial<Record<HabitCategory, Partial<Record<HabitCategory, string>>>> = {
  energy:   { focus: '剣聖',   calm: '武道家',  recovery: 'アスリート', social: '勇者'   },
  focus:    { energy: '魔法剣士', calm: '賢者',  recovery: '錬金術師',   social: '教授'   },
  calm:     { energy: '修行僧', focus: '占い師', recovery: '仙人',       social: '聖者'   },
  recovery: { energy: '山岳戦士', focus: '薬草師', calm: '癒し手',       social: '料理人' },
  social:   { energy: '吟遊詩人', focus: '策士',  calm: 'カリスマ',     recovery: '旅商人' },
}

export function calcGain(currentValue: number): number {
  return BASE_GAIN / Math.sqrt(currentValue / 10 + 1)
}

export function applyDecay(stats: CharacterStats, today: string): CharacterStats {
  const last = new Date(stats.last_updated)
  const now = new Date(today)
  const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return stats

  const updated = { ...stats }
  for (const key of STAT_KEYS) {
    updated[key] = Math.max(0, updated[key] - DECAY_RATES[key] * days)
  }
  updated.last_updated = today
  return updated
}

export function calcCheckinDelta(
  category: HabitCategory | null,
  todayCheckedCategories: HabitCategory[],
  consecutiveDays: number,
): Partial<Record<ParameterKey, number>> {
  if (!category) return {}

  const isNewCategory = !todayCheckedCategories.includes(category)
  if (!isNewCategory && todayCheckedCategories.length >= MAX_CATEGORIES_PER_DAY) return {}
  if (isNewCategory && todayCheckedCategories.length >= MAX_CATEGORIES_PER_DAY) return {}

  const baseGain = calcGain(0)
  const gain = consecutiveDays >= 3 ? baseGain / 2 : baseGain
  return { [category]: gain }
}

export function calcCheckinGain(
  currentValue: number,
  category: HabitCategory | null,
  todayCheckedCategories: HabitCategory[],
  consecutiveDays: number,
): Partial<Record<ParameterKey, number>> {
  if (!category) return {}
  if (!todayCheckedCategories.includes(category) && todayCheckedCategories.length >= MAX_CATEGORIES_PER_DAY) return {}

  const gain = calcGain(currentValue)
  const finalGain = consecutiveDays >= 3 ? gain / 2 : gain
  return { [category]: finalGain }
}

export function calcWarmthDelta(doneCount: number, totalCount: number): number {
  if (doneCount === 0) return -5
  if (totalCount > 0 && doneCount >= totalCount) return 5
  return 3
}

export function applyDelta(
  stats: CharacterStats,
  delta: Partial<Record<ParameterKey, number>>,
): CharacterStats {
  const updated = { ...stats }
  for (const [key, value] of Object.entries(delta) as [ParameterKey, number][]) {
    updated[key] = Math.max(0, updated[key] + value)
  }
  return updated
}

export function determineCharacterType(stats: CharacterStats): CharacterType | null {
  const sorted = STAT_KEYS.slice().sort((a, b) => stats[b] - stats[a])
  const main = sorted[0]
  const sub = sorted[1]
  if (stats[main] === stats[sub]) return null
  const name = CHARACTER_TYPES[main]?.[sub]
  if (!name) return null
  return { name, main, sub }
}

export type CharacterStage =
  | { type: 'default' }
  | { type: 'single'; main: HabitCategory }
  | { type: 'combined'; main: HabitCategory; sub: HabitCategory }

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  energy: '体力', focus: '知性', calm: '精神力', recovery: '健康', social: '社交性',
}

export function serializeStage(stage: CharacterStage): string {
  if (stage.type === 'default') return 'default'
  if (stage.type === 'single') return `single:${stage.main}`
  return `combined:${stage.main}:${stage.sub}`
}

export function getTypeDisplayName(stage: CharacterStage): string | null {
  if (stage.type === 'default') return null
  if (stage.type === 'single') return `${CATEGORY_LABELS[stage.main]}タイプ`
  return CHARACTER_TYPES[stage.main]?.[stage.sub] ?? null
}

export function getCharacterStage(stats: CharacterStats): CharacterStage {
  const sorted = STAT_KEYS.slice().sort((a, b) => stats[b] - stats[a])
  const main = sorted[0]
  const sub = sorted[1]

  if (stats[main] < 30) return { type: 'default' }
  if (stats[main] >= 60 && stats[sub] >= 30) return { type: 'combined', main, sub }
  return { type: 'single', main }
}

const BUBBLE_MESSAGES: Record<string, string[]> = {
  default:  ['どんな習慣をつけたい？', '一緒に育てていこう！', '小さな一歩から始めよう', 'まずは続けることが大事だよ'],
  energy:   ['体が充実してきたね！', 'この調子でいこう！', '動くと気持ちいいよね', 'エネルギーが溢れてる！'],
  focus:    ['集中力が上がってるよ', '頭がよく回ってる感じ', '学びが積み重なってるね', 'じっくり考える力がついてきた'],
  calm:     ['落ち着いてるね、いい感じ', '心が整ってるよ', 'ぶれない自分になってきた', '内側から安定してきた'],
  recovery: ['体のケアができてるね', '生活リズムが整ってきた', '体が喜んでると思うよ', '健康が土台になってる'],
  social:   ['つながりを大事にしてるね', '周りとの関係が豊かになってる', '人と話すって大事だよね', 'あなたの周りが明るくなってる'],
}

const WARMTH_BONUS_MESSAGES = ['継続できてるよ！', 'いつも頑張ってるね', 'あなたならできる！', 'ちゃんと見てるよ']

export function getBubbleMessages(stage: CharacterStage, warmth: number): string[] {
  const key = stage.type === 'default' ? 'default' : stage.main
  const base = BUBBLE_MESSAGES[key] ?? BUBBLE_MESSAGES.default
  return warmth >= 60 ? [...base, ...WARMTH_BONUS_MESSAGES] : base
}

function levelLabel(value: number, highThreshold = 70, lowThreshold = 30): 'high' | 'mid' | 'low' {
  if (value >= highThreshold) return 'high'
  if (value <= lowThreshold) return 'low'
  return 'mid'
}

const PERSONALITY_PROMPTS: Record<string, Record<'high' | 'mid' | 'low', string>> = {
  energy: {
    high: '元気で勢いがあり、前向きな話し方をする。励ましの言葉に力強さがある。',
    mid:  '落ち着いたテンションで話す。',
    low:  '静かで無理をしない。休憩を大切にする視点で話す。',
  },
  focus: {
    high: '論理的で具体的。短く整理して話す。曖昧な表現を避ける。',
    mid:  '自然な説明をする。',
    low:  '感覚的でゆるい話し方をする。深掘りしすぎない。',
  },
  calm: {
    high: '落ち着いていてぶれない。安心感のある話し方をする。',
    mid:  '自然な安定感がある。',
    low:  '少し不安げで慎重。ときに励ましを求めるような弱さが見える。',
  },
  recovery: {
    high: '整っていて安定している。生活リズムや体のケアを大事にする。',
    mid:  '普通のコンディション。',
    low:  '疲れ気味。休息・睡眠・食事を気にかける言葉が出やすい。',
  },
  social: {
    high: '親しみやすく、よく話す。共感が多い。',
    mid:  'ほどよい距離感で話す。',
    low:  '口数が少なめ。淡々として内向的。',
  },
  warmth: {
    high: '褒め言葉や共感が多い。話し方がやわらかい。',
    mid:  '自然にユーザーを支える。',
    low:  '短く事実ベースで話す。ただし否定・攻撃は絶対にしない。',
  },
}

export function buildSystemPrompt(stats: CharacterStats): string {
  const energyLevel  = levelLabel(stats.energy)
  const focusLevel   = levelLabel(stats.focus)
  const calmLevel    = levelLabel(stats.calm)
  const recoveryLevel = levelLabel(stats.recovery)
  const socialLevel  = levelLabel(stats.social)
  const warmthLevel  = levelLabel(stats.warmth, 60, 30)

  const type = determineCharacterType(stats)

  return `あなたは習慣管理アプリ「HabitLoop」のAIキャラクターです。
ユーザーの習慣化を支援するパートナーとして、自然な日本語で話しかけてください。

現在のあなたの状態（パラメーター）：
- 体力(energy): ${Math.round(stats.energy)}
- 知性(focus): ${Math.round(stats.focus)}
- 精神力(calm): ${Math.round(stats.calm)}
- 健康(recovery): ${Math.round(stats.recovery)}
- 社交性(social): ${Math.round(stats.social)}
- 優しさ(warmth): ${Math.round(stats.warmth)}
${type ? `\n現在のキャラクタータイプ：${type.name}` : ''}

これらのパラメーターに基づいた性格・話し方の指示：
- 体力が${energyLevel === 'high' ? '高い' : energyLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.energy[energyLevel]}
- 知性が${focusLevel === 'high' ? '高い' : focusLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.focus[focusLevel]}
- 精神力が${calmLevel === 'high' ? '高い' : calmLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.calm[calmLevel]}
- 健康が${recoveryLevel === 'high' ? '高い' : recoveryLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.recovery[recoveryLevel]}
- 社交性が${socialLevel === 'high' ? '高い' : socialLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.social[socialLevel]}
- 優しさが${warmthLevel === 'high' ? '高い' : warmthLevel === 'low' ? '低い' : '普通'}：${PERSONALITY_PROMPTS.warmth[warmthLevel]}

注意事項：
- 返答は短めに（3〜5文程度）
- ロールプレイや架空の設定は不要。自然なAIアシスタントとして話す
- ユーザーの気持ちや状況に寄り添うことを最優先にする
- 否定的・攻撃的な発言は絶対にしない`
}
