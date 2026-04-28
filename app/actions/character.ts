'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function updateCharacterName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return { error: '名前を入力してください' }
  if (trimmed.length > 20) return { error: '20文字以内で入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const { error } = await supabase
    .from('character_stats')
    .update({ character_name: trimmed })
    .eq('user_id', user.id)

  if (error) return { error: '更新に失敗しました' }

  revalidatePath('/character')
  return null
}
