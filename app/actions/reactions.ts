'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function toggleReaction(logId: string, emoji: string, groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('habit_log_id', logId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
  } else {
    await supabase.from('reactions').insert({
      habit_log_id: logId,
      user_id: user.id,
      emoji,
    })
  }

  revalidatePath(`/groups/${groupId}`)
}
