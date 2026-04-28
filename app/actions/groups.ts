'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function createGroup(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!name) return { error: 'グループ名を入力してください' }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, description: description || null, created_by: user.id })
    .select('id')
    .single()

  if (error) return { error: 'グループの作成に失敗しました: ' + error.message }

  // 作成者をオーナーとして追加
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'owner',
  })

  revalidatePath('/groups')
  return null
}

export async function joinGroup(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const inviteCode = (formData.get('invite_code') as string)?.trim()
  if (!inviteCode) return { error: '招待コードを入力してください' }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode)
    .single()

  if (groupError || !group) return { error: '招待コードが正しくありません' }

  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'すでにこのグループに参加しています' }

  const { error } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'member',
  })

  if (error) return { error: '参加に失敗しました: ' + error.message }

  revalidatePath('/groups')
  redirect(`/groups/${group.id}`)
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  revalidatePath('/groups')
  redirect('/groups')
}
